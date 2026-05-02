const LOAD_TIMEOUT_MS = 45000;
const SETTLE_DELAY_MS = 1500;

const projects = [
  {
    name: "Barbearia da Vila",
    slug: "barbeariadavila",
    url: "https://barbeariadavila.vercel.app/",
  },
  {
    name: "Template Restaurante",
    slug: "saborearte",
    url: "https://saborearte-seven.vercel.app/",
  },
  {
    name: "Template Pizzaria",
    slug: "fornoemassa",
    url: "https://fornoemassa.vercel.app/",
  },
  {
    name: "Template Hamburgueria",
    slug: "burguerhouse",
    url: "https://burguerhouse-lilac.vercel.app/",
  },
];

async function waitForPage(page, project) {
  try {
    await page.goto(project.url, {
      waitUntil: "networkidle",
      timeout: LOAD_TIMEOUT_MS,
    });
  } catch (error) {
    console.warn(
      `[aviso] ${project.name}: networkidle falhou, tentando carregamento normal. ${error.message}`
    );
    await page.goto(project.url, {
      waitUntil: "load",
      timeout: LOAD_TIMEOUT_MS,
    });
  }

  await page.waitForTimeout(SETTLE_DELAY_MS);
}

async function closePossibleOverlays(page, project) {
  const buttonNames = [
    /aceitar/i,
    /aceito/i,
    /accept/i,
    /agree/i,
    /concordo/i,
    /ok/i,
    /fechar/i,
    /close/i,
    /entendi/i,
    /continuar/i,
  ];

  let closedAny = false;

  for (const name of buttonNames) {
    const button = page.getByRole("button", { name }).first();
    try {
      if (await button.isVisible({ timeout: 400 })) {
        await button.click({ timeout: 1500 });
        closedAny = true;
        await page.waitForTimeout(300);
      }
    } catch {
      // Continua tentando outros seletores genéricos.
    }
  }

  const selectors = [
    '[aria-label*="fechar" i]',
    '[aria-label*="close" i]',
    '[class*="cookie" i] button',
    '[id*="cookie" i] button',
    '[class*="modal" i] button',
    '[class*="banner" i] button',
  ];

  for (const selector of selectors) {
    const element = page.locator(selector).first();
    try {
      if (await element.isVisible({ timeout: 400 })) {
        await element.click({ timeout: 1500 });
        closedAny = true;
        await page.waitForTimeout(300);
      }
    } catch {
      // Continua tentando sem interromper a captura.
    }
  }

  if (closedAny) {
    console.log(`[info] ${project.name}: overlay/modal genérico fechado.`);
  }
}

async function hideFloatingActionOverlays(page, project) {
  const hiddenCount = await page.evaluate(() => {
    const elements = Array.from(document.body.querySelectorAll("*"));
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let count = 0;

    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (style.position !== "fixed") continue;

      const rect = element.getBoundingClientRect();
      const isSmall = rect.width <= 180 && rect.height <= 180;
      const isNearBottom = rect.top >= viewportHeight * 0.55;
      const isNearSide =
        rect.left <= 48 || rect.right >= viewportWidth - 48;

      if (isSmall && isNearBottom && isNearSide) {
        element.setAttribute("data-screenshot-hidden", "true");
        element.style.setProperty("visibility", "hidden", "important");
        count += 1;
      }
    }

    return count;
  });

  if (hiddenCount > 0) {
    console.log(
      `[info] ${project.name}: ${hiddenCount} elemento(s) flutuante(s) escondido(s) antes do screenshot.`
    );
  }
}

async function capture(browser, project, target, outputDir, path) {
  const context = await browser.newContext({
    ...target.options,
    reducedMotion: "reduce",
    locale: "pt-BR",
  });

  const page = await context.newPage();
  page.setDefaultTimeout(LOAD_TIMEOUT_MS);

  const filePath = path.join(outputDir, `${project.slug}-${target.label}.png`);

  try {
    await waitForPage(page, project);
    await closePossibleOverlays(page, project);
    await hideFloatingActionOverlays(page, project);
    await page.waitForTimeout(SETTLE_DELAY_MS);
    await page.screenshot({
      path: filePath,
      fullPage: false,
      scale: "css",
    });
    console.log(`[ok] ${project.name} ${target.label}: ${filePath}`);
  } finally {
    await context.close();
  }
}

async function main() {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { chromium, devices } = await import("playwright");

  const outputDir = path.join(process.cwd(), "public", "screenshots");
  fs.mkdirSync(outputDir, { recursive: true });

  const targets = [
    {
      label: "desktop",
      options: {
        viewport: { width: 1440, height: 1000 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
      },
    },
    {
      label: "mobile",
      options: {
        ...devices["iPhone 15"],
        locale: "pt-BR",
      },
    },
  ];

  const browser = await chromium.launch({ headless: true });

  try {
    for (const project of projects) {
      for (const target of targets) {
        try {
          await capture(browser, project, target, outputDir, path);
        } catch (error) {
          console.error(
            `[erro] ${project.name} ${target.label}: ${error.message}`
          );
        }
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`[erro] Falha inesperada ao gerar screenshots: ${error.message}`);
  process.exitCode = 1;
});
