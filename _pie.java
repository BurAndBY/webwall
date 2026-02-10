import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.List;
import java.util.Locale;

import com.mojang.blaze3d.systems.RenderSystem;

public final class _pie {
    private _pie() {
    }

    public static void a(final dlx client, final dhl graphics, final amh profilerResults, final String profilerPath) {
        final List<amk> entries = profilerResults.a(profilerPath);
        final amk root = entries.remove(0);
        RenderSystem.clear(256, dlx.a);
        RenderSystem.matrixMode(5889);
        RenderSystem.loadIdentity();
        RenderSystem.ortho(0.0, client.N.k(), client.N.l(), 0.0, 1000.0, 3000.0);
        RenderSystem.matrixMode(5888);
        RenderSystem.loadIdentity();
        RenderSystem.translatef(0.0f, 0.0f, -2000.0f);
        RenderSystem.lineWidth(1.0f);
        RenderSystem.disableTexture();
        final dhn tesselator = dhn.a();
        final dhg buffer = tesselator.c();
        final int radiusX = 160;
        final int centerX = client.N.k() - 160 - 10;
        final int centerY = client.N.l() - 320;
        RenderSystem.enableBlend();
        buffer.a(7, dhj.l);
        buffer.a(centerX - 176.0f, centerY - 96.0f - 16.0f, 0.0).a(200, 0, 0, 0).d();
        buffer.a(centerX - 176.0f, centerY + 320, 0.0).a(200, 0, 0, 0).d();
        buffer.a(centerX + 176.0f, centerY + 320, 0.0).a(200, 0, 0, 0).d();
        buffer.a(centerX + 176.0f, centerY - 96.0f - 16.0f, 0.0).a(200, 0, 0, 0).d();
        tesselator.b();
        RenderSystem.disableBlend();
        double startPercent = 0.0;
        for (final amk entry : entries) {
            final int steps = aec.c(entry.a / 4.0) + 1;
            buffer.a(6, dhj.l);
            final int rgb = entry.a();
            final int red = rgb >> 16 & 0xFF;
            final int green = rgb >> 8 & 0xFF;
            final int blue = rgb & 0xFF;
            buffer.a(centerX, centerY, 0.0).a(red, green, blue, 255).d();
            for (int i = steps; i >= 0; --i) {
                final float angle = (float)((startPercent + entry.a * i / steps) * 6.2831854820251465 / 100.0);
                final float x = aec.a(angle) * radiusX;
                final float y = aec.b(angle) * radiusX * 0.5f;
                buffer.a(centerX + x, centerY - y, 0.0).a(red, green, blue, 255).d();
            }
            tesselator.b();
            buffer.a(5, dhj.l);
            for (int i = steps; i >= 0; --i) {
                final float angle = (float)((startPercent + entry.a * i / steps) * 6.2831854820251465 / 100.0);
                final float x = aec.a(angle) * radiusX;
                final float y = aec.b(angle) * radiusX * 0.5f;
                if (y <= 0.0f) {
                    buffer.a(centerX + x, centerY - y, 0.0).a(red >> 1, green >> 1, blue >> 1, 255).d();
                    buffer.a(centerX + x, centerY - y + 10.0f, 0.0).a(red >> 1, green >> 1, blue >> 1, 255).d();
                }
            }
            tesselator.b();
            startPercent += entry.a;
        }
        final DecimalFormat decimalFormat = new DecimalFormat("##0.00");
        decimalFormat.setDecimalFormatSymbols(DecimalFormatSymbols.getInstance(Locale.ROOT));
        RenderSystem.enableTexture();
        final String translatedRootName = profilerResults.b(root.d);
        String label = "";
        if (!"unspecified".equals(translatedRootName)) {
            label += "[0] ";
        }
        if (translatedRootName.isEmpty()) {
            label += "ROOT ";
        }
        else {
            label = label + translatedRootName + ' ';
        }
        client.g.a(graphics, label, (float)(centerX - 160), (float)(centerY - 80 - 16), 16777215);
        label = decimalFormat.format(root.b) + "%";
        client.g.a(graphics, label, (float)(centerX + 160 - client.g.b(label)), (float)(centerY - 80 - 16), 16777215);
        for (int i = 0; i < entries.size(); ++i) {
            final amk entry = entries.get(i);
            final StringBuilder left = new StringBuilder();
            if ("unspecified".equals(entry.d)) {
                left.append("[?] ");
            }
            else {
                left.append("[").append(i + 1).append("] ");
            }
            String text = left.append(entry.d).toString();
            client.g.a(graphics, text, (float)(centerX - 160), (float)(centerY + 80 + i * 8 + 20), entry.a());
            text = decimalFormat.format(entry.a) + "%";
            client.g.a(graphics, text, (float)(centerX + 160 - 50 - client.g.b(text)), (float)(centerY + 80 + i * 8 + 20), entry.a());
            text = decimalFormat.format(entry.b) + "%";
            client.g.a(graphics, text, (float)(centerX + 160 - client.g.b(text)), (float)(centerY + 80 + i * 8 + 20), entry.a());
        }
    }
}
