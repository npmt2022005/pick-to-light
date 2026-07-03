using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Text;
using System.Windows.Forms;
using AioiSystems.Lightstep;

namespace LsSample1a
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();

            _controller = new EthernetController();
            _controller.SetLicense(""); //Enter your license key.

            _controller.CommandReceived += new EventHandler(_controller_CommandReceived);
            _controller.ErrorRaised += new ErrorRaisedEventHandler(_controller_ErrorRaised);
        }

        private EthernetController _controller;
        private delegate void AddLogDelegate(string message);
        private readonly object _lockObject = new object();

        private void AddLog(string message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new AddLogDelegate(AddLog), message);
            }
            else
            {
                lstLog.SelectedIndex = lstLog.Items.Add(string.Format("{0} {1}",
                    DateTime.Now.ToString("HH:mm:ss.fff"),
                    message));

            }
        }

        private void SendCommand(string command)
        {
            try
            {
                AddLog("[S] " + command);
                CommandInfo response = _controller.SendCommand(command);
                AddLog("[R] " + response.GetCommandText());
            }
            catch (Exception err)
            {
                AddLog(err.Message);
            }
        }

        void _controller_CommandReceived(object sender, EventArgs e)
        {
            lock(_lockObject)
            {
                try
                {
                    CommandInfo commandInfo = _controller.GetCommand();
                    AddLog("[R] " + commandInfo.ToString());

                    AddressInfo[] results = AddressInfo.SplitCommand(commandInfo.GetCommandBytes());
                    foreach (AddressInfo addressInfo in results)
                    {
                        AddLog(string.Format("    address = {0}, status = {1}",
                            addressInfo.Address,
                            addressInfo.Status));

                        if (addressInfo.Address[0] == '9')
                        {
                            AddLog(string.Format("    input data = {0}",
                                addressInfo.InputData));
                        }
                    }
                }
                catch (Exception err)
                {
                    AddLog(err.Message);
                }
            }
        }

        void _controller_ErrorRaised(object sender, ErrorRaisedEventArgs e)
        {
            AddLog(e.Error.Message);
        }

        private void btnConnect_Click(object sender, EventArgs e)
        {
            try
            {
                _controller.Connect(txtIp.Text, (int)nudPort.Value);
                AddLog("Connected.");
            }
            catch (Exception err)
            {
                AddLog(err.Message);
            }
        }

        private void btnClose_Click(object sender, EventArgs e)
        {
            try
            {
                _controller.Close();
                AddLog("Closed.");
            }
            catch (Exception err)
            {
                AddLog(err.Message);
            }
        }

        private void btnSend_Click(object sender, EventArgs e)
        {
            SendCommand(txtCommand.Text);
        }

        private void btnSendZ_Click(object sender, EventArgs e)
        {
            SendCommand("Z");
        }

        private void btnSendA_Click(object sender, EventArgs e)
        {
            SendCommand("A");
        }

        private void btnSendPP1_Click(object sender, EventArgs e)
        {
            SendCommand("PP1050000m1$33$11$230001    50002    3");
        }

        private void btnOpenBcrif_Click(object sender, EventArgs e)
        {
            SendCommand("G9101o");
        }

        // Danh sách test: 3 sản phẩm ứng với 3 địa chỉ đèn thật (0002, 0003, 0004)
        private static readonly DemoItem[] DemoPickList = new DemoItem[]
        {
            new DemoItem("0002", 20, "ATN01-WHT-L",  "Ao thun basic trang L"),
            new DemoItem("0003", 15, "ATN01-BLK-XL", "Ao thun basic den XL"),
            new DemoItem("0004", 10, "ATN01-NVY-M",  "Ao thun basic navy M"),
        };
        
        private void btnTestDemo_Click(object sender, EventArgs e)
        {
            AddLog("=== Test: 3 SKU demo pick ===");
            foreach (DemoItem item in DemoPickList)
            {
                AddLog(string.Format("    {0} ({1}) -> addr {2}, qty {3}",
                    item.Sku, item.Name, item.Address, item.Qty));
            }

            string command = BuildP1Command("01", DemoPickList);
            SendCommand(command);
        }

        // Build lenh "P1" (Block Operation Instruction) theo dinh dang trong document.md muc 4.5:
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