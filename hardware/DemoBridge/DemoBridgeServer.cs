using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using AioiSystems.Lightstep;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace PickToLight.DemoBridge
{
    // Bridge tối giản cho demo.html: Connect() / SendCommand() đồng bộ
    // giống hệt hardware/LsSample1a/Form1.cs, chỉ khác là expose qua WebSocket
    // để trang web (không thể mở TCP trực tiếp) gọi được.
    public class DemoBridgeServer
    {
        private readonly int _port;
        private HttpListener _listener;
        private WebSocket _client;
        private readonly object _clientLock = new object();
        private readonly BlockingCollection<string> _sendQueue = new BlockingCollection<string>(200);

        private EthernetController _controller;
        private readonly object _ctrlLock = new object();

        // Danh sách test: 3 sản phẩm ứng với 3 địa chỉ đèn thật (giống Form1.cs)
        private static readonly DemoItem[] DemoPickList = new DemoItem[]
        {
            new DemoItem("0002", 20, "ATN01-WHT-L",  "Ao thun basic trang L"),
            new DemoItem("0003", 15, "ATN01-BLK-XL", "Ao thun basic den XL"),
            new DemoItem("0004", 10, "ATN01-NVY-M",  "Ao thun basic navy M"),
        };

        public DemoBridgeServer(int port) { _port = port; }

        public void Start()
        {
            new Thread(SendLoop) { IsBackground = true, Name = "SendLoop" }.Start();

            _listener = new HttpListener();
            _listener.Prefixes.Add($"http://localhost:{_port}/");
            _listener.Start();
            Console.WriteLine($"[DemoBridge] Listening on ws://localhost:{_port}/");

            while (true)
            {
                try
                {
                    HttpListenerContext ctx = _listener.GetContext();
                    if (ctx.Request.IsWebSocketRequest)
                        Task.Run(async () => { var ws = await ctx.AcceptWebSocketAsync(null); await HandleClientAsync(ws.WebSocket); });
                    else { ctx.Response.StatusCode = 400; ctx.Response.Close(); }
                }
                catch (Exception ex) { Console.WriteLine("[DemoBridge] Accept: " + ex.Message); }
            }
        }

        private async Task HandleClientAsync(WebSocket ws)
        {
            lock (_clientLock) { _client = ws; }
            Console.WriteLine("[DemoBridge] Client connected");
            SendQueued(new { type = "ready" });

            byte[] buf = new byte[8192];
            try
            {
                while (ws.State == WebSocketState.Open)
                {
                    var r = await ws.ReceiveAsync(new ArraySegment<byte>(buf), CancellationToken.None);
                    if (r.MessageType == WebSocketMessageType.Close)
                    { await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "", CancellationToken.None); break; }
                    if (r.MessageType == WebSocketMessageType.Text)
                        ProcessCommand(Encoding.UTF8.GetString(buf, 0, r.Count));
                }
            }
            catch (Exception ex) { Console.WriteLine("[DemoBridge] Client error: " + ex.Message); }
            finally { lock (_clientLock) { _client = null; } }
        }

        private void ProcessCommand(string json)
        {
            Console.WriteLine("[DemoBridge] CMD: " + json);
            try
            {
                JObject cmd = JObject.Parse(json);
                switch (cmd["type"]?.ToString())
                {
                    case "connect":
                        Connect(cmd["ip"]?.ToString(), cmd["port"]?.Value<int>() ?? 5003, cmd["licenseKey"]?.ToString() ?? "");
                        break;
                    case "close":
                        Close();
                        break;
                    case "test-demo":
                        TestDemo();
                        break;
                    case "light":
                    {
                        // {type:'light', block?:'01', items:[{address:'0002', qty:160}, ...]}
                        var items = ((JArray)cmd["items"])
                            .Select(it => new DemoItem(it["address"].ToString(), it["qty"].Value<int>(), "", ""))
                            .ToArray();
                        string block = cmd["block"]?.ToString() ?? "01";
                        SendRaw(BuildP1Command(block, items));
                        break;
                    }
                    case "clear":
                        // "Z" = xoá/tắt toàn bộ đèn trên controller
                        SendRaw("Z");
                        break;
                    default:
                        Console.WriteLine("[DemoBridge] Unknown: " + cmd["type"]);
                        break;
                }
            }
            catch (Exception ex) { SendQueued(new { type = "error", message = ex.Message }); }
        }

        private void Connect(string ip, int port, string licenseKey)
        {
            Task.Run(() =>
            {
                lock (_ctrlLock)
                {
                    try
                    {
                        try { _controller?.Close(); } catch { }

                        _controller = new EthernetController();
                        _controller.SetLicense(licenseKey);
                        _controller.CommandReceived += Controller_CommandReceived;
                        _controller.ErrorRaised     += Controller_ErrorRaised;

                        Log($"Connect {ip}:{port}...");
                        _controller.Connect(ip, port);
                        Log("Connected.");
                        SendQueued(new { type = "connected", ip, port });
                    }
                    catch (Exception ex)
                    {
                        SendQueued(new { type = "error", message = ex.Message });
                    }
                }
            });
        }

        private void Close()
        {
            Task.Run(() =>
            {
                lock (_ctrlLock)
                {
                    try
                    {
                        _controller?.Close();
                        Log("Closed.");
                        SendQueued(new { type = "closed" });
                    }
                    catch (Exception ex) { SendQueued(new { type = "error", message = ex.Message }); }
                }
            });
        }

        // Gửi một lệnh bất kỳ tới controller (dùng cho light/clear từ app)
        private void SendRaw(string command)
        {
            Task.Run(() =>
            {
                lock (_ctrlLock)
                {
                    if (_controller == null || !_controller.IsConnected)
                    {
                        SendQueued(new { type = "error", message = "Chưa kết nối controller đèn." });
                        return;
                    }
                    try
                    {
                        Log("[S] " + command);
                        CommandInfo response = _controller.SendCommand(command);
                        Log("[R] " + response.GetCommandText());
                    }
                    catch (Exception ex)
                    {
                        SendQueued(new { type = "error", message = ex.Message });
                    }
                }
            });
        }

        // Bấm nút "Test 3 SKU Demo" ở demo.html -> gửi lệnh P1 thật tới đèn,
        // y hệt btnTestDemo_Click trong LsSample1a/Form1.cs
        private void TestDemo()
        {
            Task.Run(() =>
            {
                lock (_ctrlLock)
                {
                    if (_controller == null || !_controller.IsConnected)
                    {
                        SendQueued(new { type = "error", message = "Chưa kết nối controller. Bấm Connect trước." });
                        return;
                    }

                    try
                    {
                        var items = DemoPickList.Select(it => new { address = it.Address, qty = it.Qty, sku = it.Sku, name = it.Name }).ToArray();
                        string command = BuildP1Command("01", DemoPickList);

                        Log("[S] " + command);
                        SendQueued(new { type = "demo-sent", command, items });

                        CommandInfo response = _controller.SendCommand(command);
                        string text = response.GetCommandText();
                        Log("[R] " + text);

                        AddressInfo[] addrs = AddressInfo.SplitCommand(response.GetCommandBytes());
                        SendQueued(new
                        {
                            type = "demo-response",
                            received = text,
                            addresses = addrs.Select(a => new { address = a.Address, status = a.Status }).ToArray()
                        });
                    }
                    catch (Exception ex)
                    {
                        SendQueued(new { type = "error", message = ex.Message });
                    }
                }
            });
        }

        void Controller_CommandReceived(object sender, EventArgs e)
        {
            try
            {
                CommandInfo cmd = _controller.GetCommand();
                string text = cmd.ToString();
                AddressInfo[] addrs = AddressInfo.SplitCommand(cmd.GetCommandBytes());
                Log("[R] " + text);
                SendQueued(new
                {
                    type = "received",
                    raw = text,
                    addresses = addrs.Select(a => new { address = a.Address, status = a.Status }).ToArray()
                });
            }
            catch (Exception ex) { SendQueued(new { type = "error", message = ex.Message }); }
        }

        void Controller_ErrorRaised(object sender, ErrorRaisedEventArgs e) =>
            SendQueued(new { type = "error", message = e.Error?.Message });

        // Build lenh "P1" (Block Operation Instruction):
        // P1 + Block(2 so) + [Address(4 so) + DisplayData(5 so, zero-padded)] lap lai cho tung dia chi
        private static string BuildP1Command(string blockNo, DemoItem[] items)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("P1").Append(blockNo);
            foreach (DemoItem item in items)
            {
                sb.Append(item.Address.PadLeft(4, '0'));
                sb.Append(item.Qty.ToString().PadLeft(5, '0'));
            }
            return sb.ToString();
        }

        private void Log(string message) =>
            SendQueued(new { type = "log", message, timestamp = DateTime.Now.ToString("HH:mm:ss.fff") });

        private void SendQueued(object evt)
        {
            try { _sendQueue.TryAdd(JsonConvert.SerializeObject(evt), 50); }
            catch { }
        }

        private void SendLoop()
        {
            foreach (string json in _sendQueue.GetConsumingEnumerable())
            {
                WebSocket ws; lock (_clientLock) { ws = _client; }
                if (ws == null || ws.State != WebSocketState.Open) continue;
                try
                {
                    byte[] bytes = Encoding.UTF8.GetBytes(json);
                    ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None)
                      .GetAwaiter().GetResult();
                }
                catch (Exception ex) { Console.WriteLine("[DemoBridge] Send error: " + ex.Message); }
            }
        }

        private class DemoItem
        {
            public readonly string Address;
            public readonly int Qty;
            public readonly string Sku;
            public readonly string Name;

            public DemoItem(string address, int qty, string sku, string name)
            {
                Address = address;
                Qty = qty;
                Sku = sku;
                Name = name;
            }
        }
    }
}
