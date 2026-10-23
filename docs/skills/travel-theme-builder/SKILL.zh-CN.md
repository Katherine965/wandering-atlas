# Travel 主题构建器

本文是供人工评审的中文同步版本，英文 [SKILL.md](SKILL.md) 为规范文本。如有冲突，以英文为准。在本规范中，**MUST** 表示强制要求，**SHOULD** 表示除非有书面证据否则应采用的默认做法，**MAY** 表示可选做法。

## 1. 契约与术语

1. **共享产品几何（Shared product geometry）** 是产品级空间与行为契约，包括舞台/投影、组件职责、语义顺序、功能边界、点击区域、运行时内容区域和共享字号。
2. **几何参考（Geometry reference）** 是经过验证的构图，其实测关系用于建立可复用的**几何家族（Geometry family）**。同一家族的主题先继承这些关系，再添加艺术表现。
3. **主题皮肤（Theme skin）** 是可替换的视觉层，包括资产、字体家族、颜色、材质、纹理、效果和受限的光学校正。
4. Deep Sea 是首个 **Standard Atlas Geometry Reference**。新主题 MUST 从当前共享 Atlas/Globe/Timeline 构图开始，只把 Deep Sea 作为实测几何参考，而不是视觉模板。

## 2. 不可违背的约束

- 新主题 MUST 先继承共享产品几何和一个具名几何家族，再应用主题皮肤。
- 共享组件几何与排版 MUST NOT 由每个主题独立重设计。
- Theme Switcher、Wandering Atlas 品牌和 Primary Toolbar 组成一个 **Header Composition Group**。MUST 先确定三者的内部相对关系，再把整个组定位到页面。
- Primary Toolbar 的几何 MUST 相对 Brand 定义，不得独立相对视口定位。
- 栅格资产边界 MUST NOT 重定义功能组件边界、点击区域、文本区域、焦点几何或同级对齐。
- MUST NOT 发明结构性装饰。地图框、边线、面板、阴影盒或装饰性地图容器，只有在批准概念中明确出现、在 `ASSET_MANIFEST.md` 中声明，或从所选几何参考继承时才允许存在。
- 明信片艺术 MAY 大幅变化，但信息层级与排版几何 MUST 继承共享值/参考值，除非存在已批准的结构例外。
- 主题 MAY 改变字体家族、颜色、材质、纹理、效果、字重、字形、字距和受严格限制的视觉字号缩放。主题 MUST NOT 自由选择新的字号。
- 布局覆盖 MUST 是校正，而不是重设计。
- 资产检查 MUST 批量执行，并压缩记录到 `ASSET_MANIFEST.md`。实现阶段 SHOULD 先使用清单，只重新打开有歧义或已变化的资产。
- MUST 在实现前发现必需资产集合不完整的问题。缺失角色 MUST 被记录，且 MUST NOT 用临时 CSS 艺术或无关结构元素补偿。
- 共享代码负责 Travel 数据、行为、状态、无障碍、投影和持久化；主题只负责表现。
- 世界地理 MUST 来自共享 GeoJSON。Atlas 几何、材质与标记 MUST 始终位于同一套共享 zoom/scope 变换栈中；主题 MUST NOT 引入独立投影或变换数学。
- Atlas 与 Globe MUST 保持为共享 renderer。主题 MUST NOT 为获得不同材质或效果而复制任一 renderer。
- Atlas 缩放、国家选择/聚焦、国家范围条目筛选与返回世界行为属于共享产品行为。主题只负责其颜色、效果与控件皮肤。
- Globe 旋转 MUST 保持在 renderer 本地，MUST NOT 在每个动画帧驱动 React state。静态球体效果 MUST 与旋转地理分离。
- Timeline v2 MUST 保留固定选择装饰、运行时年份条、单次 settle 滚动契约、筛选语义和共享无障碍行为。
- **ONE ASSET = ONE IMAGE。** 每个逻辑栅格角色或动画帧 MUST 对应一个图片文件；包含多个独立控件、状态或运行时节点的合成图 MUST NOT 作为在线组件资产使用。
- 现有主题和非主题系统 MUST NOT 回归。视觉主题工作在没有独立范围授权时 MUST NOT 修改后端、API、schema、migration、存储或内容模型。

## 3. 渐进式参考加载

只读取当前阶段需要的参考文档：

| 阶段或问题 | 必读参考 |
| --- | --- |
| 职责、注册表、行为、扩展点 | [01 架构](references/zh-CN/01-architecture.md) |
| 几何选择、Deep Sea 参考、响应式布局、例外 | [02 布局几何](references/zh-CN/02-layout-geometry.md) |
| 任何运行时文本或控件尺寸 | [03 排版](references/zh-CN/03-typography.md) |
| 概念拆分、资产生成、接收或审计 | [04 资产](references/zh-CN/04-assets.md) |
| Atlas/Globe 材质、投影、性能、静态 halo、边界、标记、缩放或地图装饰 | [05 地图渲染](references/zh-CN/05-map-rendering.md) |
| 明信片框、照片、元数据、标签页、画廊或灯箱 | [06 明信片构图](references/zh-CN/06-postcard-composition.md) |
| 粒子、天气、角色或装饰性运动 | [07 环境行为](references/zh-CN/07-ambient-behavior.md) |
| 就绪门禁、浏览器对比、回归或最终检查 | [08 验证](references/zh-CN/08-validation.md) |

默认不要加载全部参考文档。先读取架构与当前阶段文档；只要涉及几何或运行时文本，再加入布局与排版文档。

## 4. 必需工作流

### 4.1 仓库与几何审计

在提出或实现主题之前，检查当前 Travel 构图、主题类型/注册表、相关 CSS、选定几何参考、批准概念、资产目录、清单和脏工作树。编辑前把每个观察值分类为共享产品几何、几何家族参考或主题皮肤。

### 4.2 概念与继承声明

主题规范 MUST 指定几何家族和继承参考，并 MUST 将皮肤变化与几何变化分开列出。如果概念无法适配所选家族，使用第 5 节的例外流程；不要静默创建新布局。

### 4.3 资产就绪门禁

按照 [04 资产](references/zh-CN/04-assets.md) 一次性批量审计资产。在修改应用代码前创建或校准 `public/travel/themes/<theme-id>/ASSET_MANIFEST.md`。每个必需视觉角色 MUST 为 `READY`、有明确理由的 `NOT_REQUIRED`，或由已批准例外覆盖。任何必需角色为 `MISSING`、`UNSAFE` 或实质性 `UNCLEAR` 时，该概念的主题实现 MUST 停止。

### 4.4 实现

先应用继承几何，并在没有主题装饰的状态下验证；再把批准资产与主题皮肤映射到现有组件。可复用时 MAY 增加类型化表现能力；SHOULD NOT 增加按主题 ID 分支的行为。不要复制 Travel 页面状态或交互逻辑。

### 4.5 验证与检查点

在匹配视口尺寸下同时对照批准概念和几何参考进行验证。使用 [08 验证](references/zh-CN/08-validation.md) 检查交互、语言增长、资产适配、响应式行为、减少动态效果、跨主题隔离和仓库检查。交接前校准清单并记录未解决债务。

## 5. 例外

几何或排版例外 MUST 在实现前记录到主题 `ASSET_MANIFEST.md` 的 `## Geometry Exceptions` 下。每条记录 MUST 说明：

- 组件以及继承的家族/令牌。
- 建议值或结构变化。
- 证明继承不可行的概念或资产证据。
- 最小可行范围。
- 批准状态和验证视口。

例外 SHOULD 只修改一个关系或组件，而不是创建未命名的平行布局。只有 CSS 覆盖而没有记录，不构成例外声明。重复出现的例外只有在获得跨主题证据后，SHOULD 才升级为具名几何家族或共享令牌提案。

## 6. 当前基线

以下路径与数值示例描述当前 checkout，不是通用安装目录。在其他仓库中，MUST 先发现并映射对应入口、registry、renderer、CSS 与数据路径，再应用本技能；缺失文件或不支持的契约 MUST 如实报告，不得编造。文档、安全或发布审计中，现有完成主题 MUST 保持不变。


仓库是行为事实来源。当前五个主题为 Parchment、Cyber、Deep Sea、Ice World（Snow）和 Fairy Tale。独立版本只读：没有 Owner Edit、认证、上传、Quick Upload、D1/R2 或本地网页编辑。条目规范化在 `app/travel/travel-storage.ts`；只读 JSON 访问在 `app/travel/travel-data-source.ts`。核心组件与主题仍在 `app/travel/`；Vite 入口是 `app/main.tsx`。当前契约见 [01 架构](references/zh-CN/01-architecture.md)，渲染/性能规则见 [05 地图渲染](references/zh-CN/05-map-rendering.md)。

## 7. 中英文同步

英文文件是规范文本。`references/zh-CN/` 下的中文文件和 `SKILL.zh-CN.md` 是评审译文。每组配对文件 MUST 保持相同的章节编号、表格、令牌名、代码标识符和 MUST/SHOULD/MAY 强度。任一版本变更而另一版本未更新时，该变更不完整。如语义冲突，遵循英文并在同一变更中修正中文。

## 8. 范围边界

本技能 MAY 指导主题系统文档与视觉主题工作，但不授权修改后端、API、schema、migration、存储、内容模型或无关产品行为。仅文档任务 MUST NOT 修改主题实现或资产。
