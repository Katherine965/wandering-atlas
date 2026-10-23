# Travel Atlas 与 Globe 渲染

本文是供人工评审的中文同步版本，英文 [../05-map-rendering.md](../05-map-rendering.md) 为规范文本。

## 1. 共享地理契约

World Atlas 与 Globe MUST 通过共享 `1672 x 941` 坐标系统使用 `/data/travel-world-landmass-50m.geojson` 和 `/data/travel-world-countries-50m.geojson`。Country Focus MUST 仅使用 `/data/travel-country-detail-10m.geojson`。标记、标签、选择、Borders/Outline 状态和时间筛选后的条目保持为共享行为。

地理 MUST 使用实时路径。栅格材质 MUST NOT 包含大陆、边界、标记、标签、经纬网或选中状态。

## 2. Atlas 架构

`TravelMap.tsx` 消费由 `travel-geometry.ts` 通过自定义等距圆柱映射和共享边界 `(208, 162, 1256, 628)` 创建的路径。

- `createAtlasPaths` 使用 `d3-geo` 日期变更线裁切创建世界陆地路径，并保留每个 Polygon/MultiPolygon ring。`createCountryAtlasPaths` 增加稳定的 `ISO_A3`/`ADM0_A3` 国家 ID、name、世界路径、围绕紧凑经度中心展开的 focus path、经度中心与完整投影 bounds。当前数据处理把台湾几何合并进 `CHN`，不暴露独立 `TWN` 聚焦目标。
- `ink`、`neon` 和 `investigation` 是同一组路径上的表现家族。
- `.travel-map-zoom-layer` 负责以地图中心为锚点的等比缩放：`0.75` 到 `2.75`，步长 `.25`，默认 `1`。
- `.travel-map-scope-layer` 负责共享国家聚焦变换。`createCountryFocusTransform` 使用等比缩放和 `10%` padding，把完整国家 bounds 适配到 Atlas。
- 地理、裁切材质、国家点击路径与 `TravelMarkerLayer` MUST 保持在这套共享变换栈中。标记盒在 X/Y 上反向缩放，保持艺术和点击区稳定。主题 MUST NOT 替换这套数学。
- 在世界 scope 中，点击国家或使用 Enter/Space 选择会高亮实时路径，并显示共享 Explore 控件。聚焦 scope 只渲染选中国家的路径/材质，通过共享国家名称别名筛选已经过时间筛选的条目，并禁止继续选国家。
- 返回世界与 Escape 恢复世界 scope 和缩放 `1`。进入 Globe、Owner Edit、条目编辑或地点放置也恢复世界 scope。Owner Edit 逆向放置只在世界 scope 中运行。
- `assets.landTexture` 裁切到实时 Atlas 陆地；国家聚焦时，材质 image 使用选中国家的投影 bounds。
- 共享 map-detail 状态可隐藏国家边界；海岸线/陆地仍保留。
- 国家聚焦行为属于共享核心。主题可以设置 `--travel-country-focus-fill`、`--travel-country-focus-stroke`、`--travel-country-focus-glow` 并为共享 `TravelButton` 提供皮肤，但 MUST NOT 改变选择、筛选、scope 或变换行为。
- Deep Sea 专用 Atlas 发光/阴影是当前主题 ID 债务，MUST NOT 被复制为另一个主题分支。

## 3. Globe 几何与图层

`TravelGlobe.tsx` 使用 `d3-geo` `geoOrthographic()`，配置 `clipAngle(90)`、精度 `0.8`、中心 `(836, 476)`、直径 `485`、初始旋转 `[-10, -18, 0]`。

Parchment 还选择 `TravelCopperGlobeSurface.tsx`；Fairy Tale 选择使用独立纹理的 `TravelFairyFeltGlobeSurface.tsx`。这些 Three.js canvas surface 共用旋转/地理契约，并向 SVG fallback 提供就绪状态。MUST 验证 WebGL 不可用、资源释放、设备像素比、resize 与 reduced-motion 行为，不得假设纯 SVG 性能规则适用于每种材质。

共享 SVG/标记图层架构为：

1. 静态背景 SVG：阴影、固定 halo 区域和程序化海洋底色。
2. 旋转地理 SVG：海洋纹理、单一实时陆地几何、可选 land bloom/fill/texture/light、可选经纬网、海岸发光、国家边界、海岸线与地理标签。
3. 静态前景 SVG：反射、大气、rim 与 rim light。
4. 静态交互 SVG：透明球体点击路径。
5. HTML 标记层：命令式更新投影后的标记。

每个 renderer 实例只计算一次 sphere path。每帧只保存一份陆地几何，bloom、fill、texture、light 和 coastline 图层通过 `<use>` 与 clip path 复用。

## 4. 旋转与逐帧契约

Globe 旋转由 renderer 本地驱动，而不是 React render 驱动：

- `TravelGlobeRenderer` 拥有一个 projection、一个 `geoPath`、当前 rotation 与 target rotation。
- 同一时刻只有一个 RAF loop，统一处理拖动目标和空闲自动旋转。
- Pointer move 只更新 target rotation。它 MUST NOT 重复执行投影或创建第二个 RAF。
- React state MAY 跟踪拖动、减少动态效果等低频 UI 事实；rotation MUST NOT 使用逐帧 `setState`。
- document 隐藏时取消 RAF；重新可见时重置时间戳并恢复；卸载时取消 RAF 且只提交一次最后 rotation。
- 自动旋转速度、拖动灵敏度、纬度限制、背面裁切和标记行为是共享行为，MUST NOT 成为主题设置。

每个实际渲染旋转帧中：

- 存在陆地 GeoJSON 时，land path 最多生成一次。
- country path 挂载时，最多生成一次。
- 启用经纬网时，graticule path 最多生成一次。
- sphere path 每帧生成零次。
- 全部陆地视觉层复用同一实时几何。
- 标记与地理标签元素保持挂载，只命令式更新位置/可见性/不透明度。
- 纹理 image 元素保持挂载，只改变 `x`/`y` 位置。

## 5. 静态 Halo 与旋转地理

只依赖球体边界的效果 MUST 保持在旋转地理 SVG 之外，包括 outer halo、atmosphere、reflection、rim、rim light 和地面阴影。

- MUST NOT 对整个旋转地理 group 应用 blur、drop-shadow、mask 或 filter。
- 静态球体效果 SHOULD 使用固定 circle/ellipse/gradient 或缓存的 sphere path。
- Land bloom 与 coast glow 因依赖实时海岸线 MAY 旋转，但 MUST 引用同一份陆地几何，MUST NOT 再生成第二份投影路径。
- 动态 filter 区域 SHOULD 限制在 Globe 范围，而不是整个舞台。
- CSS transition MUST NOT 让动态地理落后一帧或产生 stale-frame 重影。

这条边界是 Cloudflare/浏览器合成性能要求；修改主题发光值时 MUST 保留。

## 6. Globe 主题与纹理契约

主题可配置 `material`、`renderMode`、标签样式、`surface` 和每张纹理的布局。资产使用 `assets.globe.landTexture` 与 `assets.globe.oceanTexture`。

- 海洋纹理裁切到球体；陆地纹理裁切到实时投影陆地。
- `textureLayout` 控制材质宽高比、可选 coverage scale 和 horizontal travel ratio。覆盖 MUST 经受全部允许经纬旋转范围。
- 缺失纹理回退到程序化 surface；缺失 Globe land 时，当前兼容回退可复用 `assets.landTexture`。
- `renderMode: "texture-only"` 移除主题叠加，但保留投影、裁切、旋转、标记和交互。
- filter、不透明度、混合模式、经纬网、海岸发光和 halo 属于表现字段。它们 MUST NOT 改变几何，也不得逐帧重建图片资源。

## 7. 标记、标签、缩放与细节

- 标记类型、坐标、按钮/点击区、选择、标签行为和地平线裁切是共享行为。
- 标记艺术与仅艺术层缩放属于主题皮肤。
- Globe 地理标签是共享运行时数据，随投影裁切/隐藏；主题只设置样式。
- Atlas 缩放动作、限制、默认值、中心锚点、国家 scope 与标记反向缩放属于共享行为。Globe 使用拖动/自动旋转，不使用 Atlas 缩放或国家聚焦。
- Map-detail capability 控制两个 renderer 中的国家边界。

## 8. 验证

先验证世界 Atlas 缩放、国家选择/聚焦、时间加国家筛选、标记配准、材质裁切、键盘激活、Escape/返回世界与 scope 重置，再对比 Atlas/Globe detail 状态。Globe 需要分析初始、自动旋转与拖动状态，确认单一 RAF、无逐帧 React render、每类启用几何每帧最多一条 path、纹理 DOM 稳定、静态 halo 分离、裁切正确且无 filter 重影。视觉验证还 MUST 覆盖接缝、纹理空边、裁切、标记/标签配准和减少动态效果。
