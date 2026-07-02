using System;

namespace PickToLight.DemoBridge
{
    class Program
    {
        static void Main(string[] args)
        {
            int port = args.Length > 0 ? int.Parse(args[0]) : 4000;
            Console.WriteLine($"[DemoBridge] Starting on port {port}");
            var bridge = new DemoBridgeServer(port);
            bridge.Start();
        }
    }
}
