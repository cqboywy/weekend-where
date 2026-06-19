// Utility: generate editorial tab-bar icons via Canvas 2D
// Open this page once in WeChat DevTools, icons appear in console
Page({
  onReady() {
    this.generateAll();
  },

  async generateAll() {
    const icons = [
      {
        name: 'home',
        draw(ctx, s, c) {
          ctx.beginPath();
          ctx.moveTo(s/2, s*0.15);
          ctx.lineTo(s*0.15, s*0.45);
          ctx.lineTo(s*0.3, s*0.45);
          ctx.lineTo(s*0.3, s*0.85);
          ctx.lineTo(s*0.7, s*0.85);
          ctx.lineTo(s*0.7, s*0.45);
          ctx.lineTo(s*0.85, s*0.45);
          ctx.closePath();
          ctx.stroke();
        }
      },
      {
        name: 'map',
        draw(ctx, s, c) {
          ctx.beginPath();
          ctx.ellipse(s/2, s*0.32, s*0.32, s*0.16, 0, 0, Math.PI*2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s*0.18, s*0.36);
          ctx.lineTo(s/2, s*0.85);
          ctx.lineTo(s*0.82, s*0.36);
          ctx.stroke();
        }
      },
      {
        name: 'add',
        draw(ctx, s, c) {
          ctx.beginPath();
          ctx.arc(s/2, s/2, s*0.35, 0, Math.PI*2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s/2, s*0.32);
          ctx.lineTo(s/2, s*0.68);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s*0.32, s/2);
          ctx.lineTo(s*0.68, s/2);
          ctx.stroke();
        }
      },
      {
        name: 'list',
        draw(ctx, s, c) {
          for (let i = 0; i < 3; i++) {
            const y = s*(0.3 + i*0.2);
            ctx.beginPath();
            ctx.roundRect(s*0.2, y, s*0.6, s*0.08, s*0.04);
            ctx.stroke();
          }
        }
      },
      {
        name: 'mine',
        draw(ctx, s, c) {
          ctx.beginPath();
          ctx.arc(s/2, s*0.3, s*0.14, 0, Math.PI*2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(s/2, s*0.7, s*0.22, s*0.17, 0, Math.PI, 0);
          ctx.stroke();
        }
      },
    ];

    for (const icon of icons) {
      for (const active of [false, true]) {
        await this.generateIcon(icon, active);
      }
    }
    console.log('ALL DONE — check images/console for base64 data');
  },

  generateIcon(icon, active) {
    return new Promise((resolve) => {
      const query = wx.createSelectorQuery();
      query.select('#iconCanvas').fields({ node: true, size: true }).exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const out = 81;
        const dpr = 3;
        canvas.width = out * dpr;
        canvas.height = out * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, out, out);

        const color = active ? '#C2674A' : '#9E9688';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        icon.draw(ctx, out, color);

        wx.canvasToTempFilePath({
          canvas,
          x: 0, y: 0, width: out, height: out,
          destWidth: out, destHeight: out,
          success: (result) => {
            // Read back as base64
            const fs = wx.getFileSystemManager();
            fs.readFile({
              filePath: result.tempFilePath,
              encoding: 'base64',
              success: (readRes) => {
                const name = active ? `tab-${icon.name}-active` : `tab-${icon.name}`;
                console.log(`\n=== ${name}.png ===`);
                console.log(readRes.data);
                resolve();
              },
              fail: () => resolve(),
            });
          },
          fail: () => resolve(),
        });
      });
    });
  },
});
