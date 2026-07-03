namespace LsSample1a
{
    partial class Form1
    {
        /// <summary>
        /// 必要なデザイナ変数です。
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 使用中のリソースをすべてクリーンアップします。
        /// </summary>
        /// <param name="disposing">マネージ リソースが破棄される場合 true、破棄されない場合は false です。</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows フォーム デザイナで生成されたコード

        /// <summary>
        /// デザイナ サポートに必要なメソッドです。このメソッドの内容を
        /// コード エディタで変更しないでください。
        /// </summary>
        private void InitializeComponent()
        {
            this.btnConnect = new System.Windows.Forms.Button();
            this.txtIp = new System.Windows.Forms.TextBox();
            this.nudPort = new System.Windows.Forms.NumericUpDown();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.btnClose = new System.Windows.Forms.Button();
            this.btnSendZ = new System.Windows.Forms.Button();
            this.btnSendA = new System.Windows.Forms.Button();
            this.txtCommand = new System.Windows.Forms.TextBox();
            this.btnSend = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            this.lstLog = new System.Windows.Forms.ListBox();
            this.btnSendPP1 = new System.Windows.Forms.Button();
            this.btnOpenBcrif = new System.Windows.Forms.Button();
            this.btnTestDemo = new System.Windows.Forms.Button();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            ((System.ComponentModel.ISupportInitialize)(this.nudPort)).BeginInit();
            this.groupBox1.SuspendLayout();
            this.SuspendLayout();
            // 
            // btnConnect
            // 
            this.btnConnect.Location = new System.Drawing.Point(252, 16);
            this.btnConnect.Name = "btnConnect";
            this.btnConnect.Size = new System.Drawing.Size(75, 23);
            this.btnConnect.TabIndex = 0;
            this.btnConnect.Text = "Connect";
            this.btnConnect.UseVisualStyleBackColor = true;
            this.btnConnect.Click += new System.EventHandler(this.btnConnect_Click);
            // 
            // txtIp
            // 
            this.txtIp.Location = new System.Drawing.Point(31, 18);
            this.txtIp.Name = "txtIp";
            this.txtIp.Size = new System.Drawing.Size(107, 19);
            this.txtIp.TabIndex = 1;
            this.txtIp.Text = "192.168.1.254";
            // 
            // nudPort
            // 
            this.nudPort.Location = new System.Drawing.Point(183, 19);
            this.nudPort.Maximum = new decimal(new int[] {
            65535,
            0,
            0,
            0});
            this.nudPort.Name = "nudPort";
            this.nudPort.Size = new System.Drawing.Size(52, 19);
            this.nudPort.TabIndex = 2;
            this.nudPort.Value = new decimal(new int[] {
            5003,
            0,
            0,
            0});
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(10, 22);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(15, 12);
            this.label1.TabIndex = 3;
            this.label1.Text = "IP";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(151, 22);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(26, 12);
            this.label2.TabIndex = 3;
            this.label2.Text = "Port";
            // 
            // btnClose
            // 
            this.btnClose.Location = new System.Drawing.Point(333, 16);
            this.btnClose.Name = "btnClose";
            this.btnClose.Size = new System.Drawing.Size(75, 23);
            this.btnClose.TabIndex = 0;
            this.btnClose.Text = "Close";
            this.btnClose.UseVisualStyleBackColor = true;
            this.btnClose.Click += new System.EventHandler(this.btnClose_Click);
            // 
            // btnSendZ
            // 
            this.btnSendZ.Location = new System.Drawing.Point(10, 68);
            this.btnSendZ.Name = "btnSendZ";
            this.btnSendZ.Size = new System.Drawing.Size(75, 23);
            this.btnSendZ.TabIndex = 4;
            this.btnSendZ.Text = "Send Z";
            this.btnSendZ.UseVisualStyleBackColor = true;
            this.btnSendZ.Click += new System.EventHandler(this.btnSendZ_Click);
            // 
            // btnSendA
            // 
            this.btnSendA.Location = new System.Drawing.Point(91, 68);
            this.btnSendA.Name = "btnSendA";
            this.btnSendA.Size = new System.Drawing.Size(75, 23);
            this.btnSendA.TabIndex = 4;
            this.btnSendA.Text = "Send A";
            this.btnSendA.UseVisualStyleBackColor = true;
            this.btnSendA.Click += new System.EventHandler(this.btnSendA_Click);
            // 
            // txtCommand
            // 
            this.txtCommand.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)
                        | System.Windows.Forms.AnchorStyles.Right)));
            this.txtCommand.Location = new System.Drawing.Point(73, 320);
            this.txtCommand.Name = "txtCommand";
            this.txtCommand.Size = new System.Drawing.Size(411, 19);
            this.txtCommand.TabIndex = 5;
            // 
            // btnSend
            // 
            this.btnSend.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.btnSend.Location = new System.Drawing.Point(490, 318);
            this.btnSend.Name = "btnSend";
            this.btnSend.Size = new System.Drawing.Size(70, 23);
            this.btnSend.TabIndex = 6;
            this.btnSend.Text = "Send";
            this.btnSend.UseVisualStyleBackColor = true;
            this.btnSend.Click += new System.EventHandler(this.btnSend_Click);
            // 
            // label3
            // 
            this.label3.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left)));
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(12, 323);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(55, 12);
            this.label3.TabIndex = 7;
            this.label3.Text = "Command";
            // 
            // lstLog
            // 
            this.lstLog.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
                        | System.Windows.Forms.AnchorStyles.Left)
                        | System.Windows.Forms.AnchorStyles.Right)));
            this.lstLog.Font = new System.Drawing.Font("Courier New", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lstLog.FormattingEnabled = true;
            this.lstLog.ItemHeight = 16;
            this.lstLog.Location = new System.Drawing.Point(12, 97);
            this.lstLog.Name = "lstLog";
            this.lstLog.Size = new System.Drawing.Size(548, 212);
            this.lstLog.TabIndex = 8;
            // 
            // btnSendPP1
            // 
            this.btnSendPP1.Location = new System.Drawing.Point(172, 68);
            this.btnSendPP1.Name = "btnSendPP1";
            this.btnSendPP1.Size = new System.Drawing.Size(137, 23);
            this.btnSendPP1.TabIndex = 9;
            this.btnSendPP1.Text = "Start Light-Module";
            this.btnSendPP1.UseVisualStyleBackColor = true;
            this.btnSendPP1.Click += new System.EventHandler(this.btnSendPP1_Click);
            // 
            // btnOpenBcrif
            // 
            this.btnOpenBcrif.Location = new System.Drawing.Point(315, 68);
            this.btnOpenBcrif.Name = "btnOpenBcrif";
            this.btnOpenBcrif.Size = new System.Drawing.Size(103, 23);
            this.btnOpenBcrif.TabIndex = 10;
            this.btnOpenBcrif.Text = "Open BCRi/f";
            this.btnOpenBcrif.UseVisualStyleBackColor = true;
            this.btnOpenBcrif.Click += new System.EventHandler(this.btnOpenBcrif_Click);
            //
            // btnTestDemo
            //
            this.btnTestDemo.Location = new System.Drawing.Point(428, 68);
            this.btnTestDemo.Name = "btnTestDemo";
            this.btnTestDemo.Size = new System.Drawing.Size(130, 23);
            this.btnTestDemo.TabIndex = 12;
            this.btnTestDemo.Text = "Test 3-SKU Demo";
            this.btnTestDemo.UseVisualStyleBackColor = true;
            this.btnTestDemo.Click += new System.EventHandler(this.btnTestDemo_Click);
            //
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.txtIp);
            this.groupBox1.Controls.Add(this.btnConnect);
            this.groupBox1.Controls.Add(this.btnClose);
            this.groupBox1.Controls.Add(this.nudPort);
            this.groupBox1.Controls.Add(this.label1);
            this.groupBox1.Controls.Add(this.label2);
            this.groupBox1.Location = new System.Drawing.Point(10, 9);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(549, 50);
            this.groupBox1.TabIndex = 11;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Controller Session";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(572, 353);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.btnTestDemo);
            this.Controls.Add(this.btnOpenBcrif);
            this.Controls.Add(this.btnSendPP1);
            this.Controls.Add(this.lstLog);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.btnSend);
            this.Controls.Add(this.txtCommand);
            this.Controls.Add(this.btnSendA);
            this.Controls.Add(this.btnSendZ);
            this.Name = "Form1";
            this.Text = "Form1";
            ((System.ComponentModel.ISupportInitialize)(this.nudPort)).EndInit();
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnConnect;
        private System.Windows.Forms.TextBox txtIp;
        private System.Windows.Forms.NumericUpDown nudPort;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button btnClose;
        private System.Windows.Forms.Button btnSendZ;
        private System.Windows.Forms.Button btnSendA;
        private System.Windows.Forms.TextBox txtCommand;
        private System.Windows.Forms.Button btnSend;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.ListBox lstLog;
        private System.Windows.Forms.Button btnSendPP1;
        private System.Windows.Forms.Button btnOpenBcrif;
        private System.Windows.Forms.Button btnTestDemo;
        private System.Windows.Forms.GroupBox groupBox1;
    }
}

