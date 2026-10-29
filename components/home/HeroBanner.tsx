import { HeroVideo } from "./HeroVideo";
import { siteConfig } from "@/siteConfig";

/**
 * 顶部横幅：整块动图 + 居中的站名与副标题。
 *
 * 分成三段：画面、压暗遮罩、文字。
 * 遮罩是必须的——壁纸很亮，白字直接压上去会糊。
 */
export function HeroBanner() {
  return (
    <section className="hero-bleed" aria-label="站点横幅">
      <div className="relative h-[clamp(18rem,50vh,34rem)] w-full overflow-hidden">
        <HeroVideo />

        {/* 压暗 + 底部渐隐：让白字站得住，也让横幅和下面的内容自然接上 */}
        <div className="hero-scrim absolute inset-0" />

        {/* 顶部再补一层，只覆盖导航高度，保证白字在浅色画面上也读得清 */}
        <div className="hero-navscrim absolute inset-x-0 top-0" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          {/* 只在文字这块垫一层暗晕，压住背后近白的衬衫 */}
          <div className="hero-title-glow" aria-hidden="true" />
          {/* relative z-10 是必需的：暗晕是绝对定位元素，
              不带 z-index 时会盖在静态流里的文字上，把标题压成灰的 */}
          <h1 className="hero-title relative z-10 text-4xl font-bold tracking-tight text-white sm:text-7xl">
            {siteConfig.hero.title}
          </h1>
          <p className="relative z-10 mt-4 text-sm font-medium text-white [text-shadow:0_1px_3px_rgba(8,12,22,0.55),0_2px_12px_rgba(8,12,22,0.5)] sm:mt-5 sm:text-lg">
            {siteConfig.hero.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}