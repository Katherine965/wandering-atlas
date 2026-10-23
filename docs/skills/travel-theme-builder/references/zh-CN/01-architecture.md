# Travel 主题架构

本文是供人工评审的中文同步版本，英文 [../01-architecture.md](../01-architecture.md) 为规范文本。

## 1. 事实来源与当前文件

可执行代码优先于本文、资产清单和历史审计。检查以下文件的当前版本：

| 关注点 | 当前来源 |
| --- | --- |
| 页面状态与构图 | `app/travel/page.tsx` |
| 共享舞台与控件 | `app/travel/components/TravelAtlasStage.tsx`、`TravelHeader.tsx`、`TravelButton.tsx`、`TravelThemeSwitcher.tsx` |
| Atlas | `TravelMap.tsx`、`travel-geometry.ts` |
| Globe | `TravelGlobe.tsx`、`TravelGlobeGeographicLabels.tsx`、`travel-globe-labels.ts`、`TravelCopperGlobeSurface.tsx`、`TravelFairyFeltGlobeSurface.tsx` |
| 共享标记 | `TravelMarkerLayer.tsx`、`TravelMarker.tsx` |
| Timeline 与筛选 | `TravelTimeline.tsx`、`travel-time.ts` |
| 主题契约与注册表 | `app/travel/themes/types.ts`、`registry.ts`、`use-travel-theme.ts` 和每个开放主题文件 |
| 最终表现 | `app/globals.css` 中的 Travel 选择器 |
| 运行时资产 | `public/travel/themes/<theme-id>/` 与当前主题定义 |

Current standalone architecture is documented in `docs/ARCHITECTURE.md`; current source and actual browser evidence take precedence.

## 2. 开放主题

当前注册表提供五个可选主题：

| 主题 ID | Map renderer | Globe 材质 | Timeline v2 表现 |
| --- | --- | --- | --- |
| `parchment` | `ink` | `antique`，程序化 Three.js 铜材质与 SVG fallback | HUD frame 与 point |
| `cyber` | `neon` | `crystalline`，独立陆地/海洋纹理 | HUD frame 与 point |
| `deep-sea` | `investigation` | `crystalline`，独立陆地/海洋纹理 | 资产 frame 与 point |
| `ice-world` | `investigation` | `crystalline`，独立陆地/海洋纹理 | 资产 frame 与 point |
| `fairy-tale` | `investigation` | `antique`，独立陆地/海洋纹理与 Three.js 毛毡 surface；Atlas 复用 Globe 陆地 | 资产 frame 与 point |

Only the five registered themes are in scope; do not add experimental themes without separate authorization.

## 3. 职责模型

共享核心 MUST 负责：

- 条目规范化、筛选、持久化、CRUD、上传和存储键。
- Journey/Location 语义、选择、明信片、画廊、灯箱和 只读行为。
- Atlas/Globe 选择、Atlas 缩放与国家 scope、`1672 x 941` 坐标空间、GeoJSON、投影、Atlas 逆向放置、标记坐标、Globe 旋转和可见性裁切。
- Timeline mode、focused year、年份范围、滚动、吸附、键盘行为和条目筛选。
- 无障碍名称、语义控件、焦点、禁用状态和减少动态效果行为。

主题表现 MAY 负责：

- 背景/环境艺术、字体家族、颜色、材质、纹理、边线、阴影、发光和克制动效。
- 从现有类型化家族中选择 renderer。
- Atlas 国家高亮颜色/效果变量与共享 scope 控件皮肤，但不得改变国家行为或变换数学。
- Globe surface 值、纹理布局、标签样式和可选纯纹理表现。
- 标记艺术和仅作用于艺术层的视觉缩放。
- 控件、图例、缩放、Timeline v2、明信片、画廊、灯箱和 Owner Edit 皮肤。
- 可选的无产品语义环境资产与表现。

主题 MUST NOT 为获得不同外观而复制共享状态、投影、renderer 标记或交互逻辑。

## 4. 当前构图

```text
TravelPage
`-- TravelAtlasStage
    |-- background and optional map frame
    |-- TravelHeader / TravelThemeSwitcher
    |-- shared toolbar and Atlas/Globe selector
    |-- TravelMap OR TravelGlobe
    |   `-- TravelMarkerLayer
    |-- optional theme ambient actor
    |-- TravelZoomControl
    |-- TravelLegend / TravelMapDetailToggle
    |-- TravelTimeline
    |-- TravelPostcard / scrapbook / TravelLightbox
    `-- read-only data source
```

`TravelPage` 先计算 `timelineFilteredPlaces`。世界 scope 把这批条目传给当前 renderer；Atlas 国家 scope 再通过共享国家名称/ID 映射筛选，并只渲染聚焦国家。进入 Globe时，Atlas scope 与缩放回到世界默认值。Globe 的实时旋转位于 `TravelGlobe` 内部，只在 Globe 卸载时提交到 `TravelPage.globeRotation`，因此切换视图可恢复朝向。

## 5. 主题契约

`AvailableTravelTheme` 当前提供：

| 契约区域 | 当前形态 |
| --- | --- |
| 元数据 | `id`、`label`、`labelZh`、`available` |
| 布局/capabilities | `brandLayout`、`capabilities.globe`、`capabilities.mapDetail` |
| 激活 | `rootClassName`、`data-travel-theme` |
| Renderers | button、legend、map、marker、postcard、switcher、timeline、zoom |
| Visuals | `globe`、Journey/Location `markerScale`、明信片竖图处理、Timeline v2 策略/布局 |
| Assets | background，以及可选控件、标记、Atlas 材质/frame、Globe 纹理、明信片、Timeline、切换器、环境和 Owner Edit 槽 |

注册与持久化集中在 `registry.ts` 和 `use-travel-theme.ts`。存储键为 `wandering-atlas-theme`；无效或不可用 ID 回退到 Parchment。

- Renderer 名称只选择表现；它们 MUST NOT 创建独立的数据或交互实现。
- 可复用表现需求 SHOULD 成为类型化 renderer variant、capability、visual 字段或 asset slot。
- 不改变结构或行为的一次性视觉校正 MAY 保留为主题作用域 CSS。
- SHOULD NOT 在共享行为或组件标记中增加主题 ID 分支。

## 6. Atlas、Globe 与 Timeline 边界

Atlas 与 Globe 消费同一份陆地/国家 GeoJSON 和标记数据，但使用不同投影。Atlas 负责自定义等距圆柱世界投影、中心锚定缩放、国家选择/聚焦、国家范围条目筛选与仅世界 scope 的 Owner Edit 放置。Globe 使用共享正射 renderer、指针拖动、空闲旋转、地平线裁切、地理标签和 renderer-local 帧更新。修改任一 renderer 或 Globe 效果前，先读 [05 地图渲染](../05-map-rendering.md)。

全部开放主题都选择 `visuals.timeline.structure: "v2"`。Timeline v2 渲染完整运行时年份范围，frame 与 selected ornament 固定，年份条在其下方滚动。settle 规则属于共享行为：

- 用户滚动、滚轮、点击、上一年/下一年和方向键导航 MUST 只产生一次 focused-year 变化和一次视觉位移。
- 原生 `scrollend` 与 `140 ms` fallback MUST 按当前 scroll sequence 去重。
- 由当前滚动/点击序列产生的 focused year MUST NOT 再触发 external focused-year effect 二次滚动。
- 外部 focused-year 变化 MAY 使用 `behavior: "auto"` 对齐一次。
- CSS 居中 snap 保持为对齐机制；settle MUST NOT 再做第二次手动校正。
- 改变 `focusedYear` 不切换 `mode`；`all` 显示所有条目，`year` 应用 `filterTravelEntries`。

## 7. 当前例外

以下是实现事实，不是可复制模式：

- `TravelMap.tsx` 按主题 ID 选择 Deep Sea 专用地图效果。
- `TravelGlobe.tsx` 当前按 Parchment/Fairy-tale ID 选择铜与毛毡 surface。这些是表现分支，不允许复制地理行为。
- CSS 中主题根 class 与 `data-travel-theme` 选择器是有意的表现边界。

新工作 MUST 优先使用类型化表现配置，而不是增加新的主题 ID 分支。

## 8. 扩展决策

按以下顺序处理：

1. 现有共享组件与共享行为。
2. 现有 renderer family 或类型化 visual/asset 字段。
3. 主题作用域皮肤或资产安全区校正。
4. 已批准几何例外。
5. 当多个主题证明有需要时，采用可复用的类型化 capability 或具名几何家族。

不要因为资产不方便就重设计共享行为。
