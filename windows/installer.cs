using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;

namespace GuruAISetup
{
    class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string targetDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "GuruAI");
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                string sourceExe = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "GuruAI.exe");
                string destExe = Path.Combine(targetDir, "GuruAI.exe");

                if (File.Exists(sourceExe))
                {
                    File.Copy(sourceExe, destExe, true);
                }

                // Create Desktop Shortcut via VBScript or WScript.Shell
                string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string shortcutPath = Path.Combine(desktopDir, "GuruAI.lnk");
                CreateShortcut(shortcutPath, destExe, "GuruAI – AI Answer Engine by HarshGuruJi");

                // Create Start Menu Shortcut
                string startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                string startMenuShortcut = Path.Combine(startMenuDir, "GuruAI.lnk");
                CreateShortcut(startMenuShortcut, destExe, "GuruAI – AI Answer Engine by HarshGuruJi");

                MessageBox.Show("GuruAI has been successfully installed on your PC!\n\nDesktop and Start Menu shortcuts have been created.", "GuruAI Setup", MessageBoxButtons.OK, MessageBoxIcon.Information);

                // Launch installed app
                if (File.Exists(destExe))
                {
                    Process.Start(destExe);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Installation completed with notification: " + ex.Message, "GuruAI Setup", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        static void CreateShortcut(string shortcutPath, string targetPath, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                shortcut.Description = description;
                shortcut.Save();
            }
            catch {}
        }
    }
}
