# Travel 主题资产

本文是供人工评审的中文同步版本，英文 [../04-assets.md](../04-assets.md) 为规范文本。

## 1. 资产权威

批准资产是艺术权威，不是布局权威。栅格画布边界 MUST NOT 重定义共享功能盒、文本区域、点击区、投影几何或组件关系。

当前主题定义和 CSS 直接 URL 决定运行时实际加载内容。`ASSET_MANIFEST.md` 记录证据与意图，但与可执行引用冲突时 MUST 校准。

## 2. ONE ASSET = ONE IMAGE

**ONE ASSET = ONE IMAGE** 是默认运行时约定：

- 每个逻辑栅格角色或状态 MUST 有一个图片文件和一个规范运行时路径。
- 单个文件 MUST NOT 合并多个独立控件、标记、Timeline 节点、选中/未选中状态、本地化文字或组件外壳，再由运行时裁切。
- 单个语义 frame 图片 MAY 由 CSS 分片或拉伸，以保护固定端帽和连续中心，因为它仍然是一个 frame 资产。
- 当主题有意复用完全相同的艺术时，一个角色图片 MAY 用于多个尺寸；当前按钮 frame 配置就是这种情况。
- 动画使用有序数组中的逐帧独立图片。sprite sheet 不是当前约定。
- 来源图和已替换合成图 MAY 保留在文档中，但除非代码实际引用，否则 MUST NOT 被视为在线资产。

运行时文字、年份、标签、日期、评分、坐标、照片、选中状态、禁用状态和无障碍名称 MUST 保持为 HTML/SVG/数据。

## 3. 当前资产分类与槽位

把每张图片归入一个主要角色：

1. 背景/环境：`assets.background`。
2. Atlas 材质：`assets.landTexture`，裁切到实时 Atlas 陆地。
3. Globe 材质：`assets.globe.landTexture` 与 `assets.globe.oceanTexture`。
4. 组件皮肤：按钮、图例、缩放、明信片、Timeline、切换器、地图视图控件或 Owner Edit。
5. 标记艺术：Journey 或 Location，可选图例专用副本。
6. 环境装饰或动画帧：只适用于另行授权的未来工作；当前五主题版本没有对应 actor。

当前目录混合基于角色的文件名和保留的 `MsgID` 不透明文件名，且很多 `.jpeg` 路径实际包含 PNG 数据。必须检查文件内容、尺寸、alpha 和视觉角色；不要从扩展名/名称推断格式或语义。

## 4. 材质与纹理规则

- Atlas 与 Globe 材质 MUST 是平面可复用表面，不含烘焙大陆、国家边界、经纬网、标签、标记、球体边缘、光照或选中状态。
- Atlas 国家聚焦在实时聚焦国家路径与投影 bounds 内复用 `assets.landTexture`。MUST NOT 增加国家专用纹理、轮廓图、选中覆盖图或合成控件资产。
- Globe land 与 ocean 是独立角色。陆地由实时投影陆地路径裁切；海洋由固定球体路径裁切。
- Globe 纹理 MUST NOT 是整页背景、Atlas 截图、UI frame 或预渲染地球。
- 记录宽高比、coverage scale、travel ratio、不透明度、混合模式、滤镜、裁切与禁止重复规则。
- 在全部允许旋转下 MUST 完整覆盖，不出现接缝、空白边缘或明显重复。
- 优先使用独立 Atlas 与 Globe 材质。Fairy Tale 当前把一个材质用于 Atlas land 与 Globe land，这是已记录的当前例外，不是默认做法。
- Globe 旋转时纹理图片 MUST 保持挂载；运行时只更新位置属性，不重建图片资源。

## 5. 批量审计工作流

1. 一次性盘点路径、实际格式、尺寸、alpha 和哈希。
2. 可行时为每个相关批次制作一张联系表。
3. 检查每个资产的角色、可见边界、留白、安全区、烘焙内容、裁切/拉伸约束、重复项和异常。
4. 与当前主题定义和 CSS 直接引用比对。
5. 校准 `ASSET_MANIFEST.md`；实现阶段只重新打开已变化或有歧义的资产。

文件名和尺寸 MUST NOT 替代视觉检查。

## 6. 清单契约

使用 `public/travel/themes/<theme-id>/ASSET_MANIFEST.md`，至少包含：

```markdown
| Canonical path | Dimensions | Alpha | Category | Role/state | Fit/safe area | Required | Status | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
```

允许的状态值为 `READY`、`MISSING`、`UNSAFE`、`UNCLEAR`、`REJECTED`、`DUPLICATE`、`UNUSED` 和 `NOT_REQUIRED`。

清单 MUST 将作者/来源、获取日期、许可证据与再分发状态、署名要求、公开发布资格与核实动作，与视觉就绪状态分开记录。未知权利 MUST 保持 `UNVERIFIED`；`READY` 不代表法律许可。免费素材或看似生成的图像 MUST NOT 被默认视为可再分发。带凭据的下载查询元数据 MUST NOT 写入公开清单或文件名；应记录脱敏稳定标识，并申请另行批准的清理，不得在审计中直接重命名资产。

清单 MUST 记录来源、运行时路径、适配/裁切/拉伸/clip 规则、透明留白、功能安全区、烘焙内容风险、动画帧顺序、纹理布局和 `## Geometry Exceptions`。

## 7. 就绪与安全区

- 每个概念必需角色 MUST 为 `READY`，或有理由标为 `NOT_REQUIRED`，才能称实现完成。
- 缺失艺术 MUST NOT 用无关 frame、通用面板、临时结构装饰或烘焙运行时内容替代。
- 区分源画布、绘制边界、装饰溢出、功能盒、运行时内容安全区和点击区。
- `contain`、`cover`、`fill`、crop、slicing 或受控视觉缩放 MAY 遵循清单，但艺术 MUST NOT 移动功能锚点或缩小语义点击区。

## 8. 当前目录约定

```text
public/travel/themes/<theme-id>/
|-- ASSET_MANIFEST.md
|-- background.png
|-- textures/
|-- ui/
`-- ambient/ or ui/crawler/
```

新规范化资产 SHOULD 使用基于角色的小写名称。不要只为命名一致而重命名不透明/来源文件；真正批准规范化时，同步更新运行时引用和清单。
