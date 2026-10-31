using System;
using System.Drawing;
using System.Windows.Forms;
using System.Diagnostics;
using Microsoft.Win32;

namespace GuruAI
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            // Set modern IE11/Edge emulation for WebBrowser control if needed
            try
            {
                string appName = Process.GetCurrentProcess().ProcessName + ".exe";
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION"))
                {
                    if (key != null)
                    {
                        key.SetValue(appName, 11001, RegistryValueKind.DWord);
                    }
                }
            }
            catch {}

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainWindow());
        }
    }

    public class MainWindow : Form
    {
        private WebBrowser browser;
        private NotifyIcon trayIcon;

        public MainWindow()
        {
            this.Text = "GuruAI – AI Answer Engine by HarshGuruJi";
            this.Size = new Size(1280, 840);
            this.MinimumSize = new Size(900, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(11, 17, 32); // #0B1120

            // Try loading window icon
            try
            {
                string iconPath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "logo.ico");
                if (System.IO.File.Exists(iconPath))
                {
                    this.Icon = new Icon(iconPath);
                }
            }
            catch {}

            // Setup Browser
            browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.ScriptErrorsSuppressed = true;
            browser.IsWebBrowserContextMenuEnabled = true;

            // Load GuruAI web app
            string url = "https://ai.webguruji.online/";
            browser.Navigate(url);

            this.Controls.Add(browser);

            // System Tray Setup
            trayIcon = new NotifyIcon();
            trayIcon.Text = "GuruAI – AI Answer Engine";
            if (this.Icon != null) trayIcon.Icon = this.Icon;
            else trayIcon.Icon = SystemIcons.Application;
            trayIcon.Visible = true;

            ContextMenu trayMenu = new ContextMenu();
            trayMenu.MenuItems.Add("Open GuruAI", (s, e) => { this.Show(); this.WindowState = FormWindowState.Normal; this.BringToFront(); });
            trayMenu.MenuItems.Add("New Thread", (s, e) => { this.Show(); browser.Navigate("https://ai.webguruji.online/"); });
            trayMenu.MenuItems.Add("-");
            trayMenu.MenuItems.Add("Exit", (s, e) => { trayIcon.Visible = false; Application.Exit(); });
            trayIcon.ContextMenu = trayMenu;

            trayIcon.DoubleClick += (s, e) => { this.Show(); this.WindowState = FormWindowState.Normal; this.BringToFront(); };
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
            base.OnFormClosing(e);
        }
    }
}
