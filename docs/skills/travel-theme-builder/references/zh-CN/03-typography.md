# Travel 排版

本文是供人工评审的中文同步版本，英文 [../03-typography.md](../03-typography.md) 为规范文本。

## 1. 排版契约

字号属于共享几何。字体家族、颜色、材质、纹理、效果、字重、字形和字距属于主题皮肤。

主题 MUST 从下列共享角色令牌开始。对于有字体度量证据的情况，MAY 在 `0.95-1.05` 范围内应用视觉缩放。更大的变化需要已声明的几何例外。

## 2. 共享角色令牌

这些是规范令牌。在专门的令牌重构获得范围授权前，现有 CSS 变量 MAY 映射到这些令牌。品牌字号只适用于 Standard Atlas 家族；其余角色属于共享产品令牌。

| 令牌 | 参考字号 | 范围 | 角色 |
| --- | ---: | --- | --- |
| `--travel-type-brand-title` | `2.75cqw` | `standard-atlas` | 品牌标题 |
| `--travel-type-brand-subtitle` | `.76cqw` | `standard-atlas` | 品牌副标题 |
| `--travel-type-primary-action` | `1.065cqw` | 共享 | 主工具栏操作与 Atlas/Globe 标签 |
| `--travel-type-secondary-control` | `.96cqw` | 共享 | 语言及普通次级控件 |
| `--travel-type-secondary-compact` | `.746cqw` | 共享 | 紧凑型 Outline/Borders 控件 |
| `--travel-type-legend` | `.852cqw` | 共享 | 图例文本 |
| `--travel-type-postcard-title` | `1.12cqw` | 共享 | 未缩放参考卡片内的地点标题 |
| `--travel-type-postcard-eyebrow` | `.37cqw` | 共享 | 国家/地区/类型行 |
| `--travel-type-postcard-tab` | `.46cqw` | 共享 | 明信片标签页 |
| `--travel-type-postcard-caption` | `.48cqw` | 共享 | 图注、笔记与详情正文 |
| `--travel-type-postcard-meta-label` | `.43cqw` | 共享 | 元数据标签 |
| `--travel-type-postcard-meta-value` | `.49cqw` | 共享 | 元数据值 |
| `--travel-type-timeline-year` | `.68cqw` | 共享 | 时间线年份 |
| `--travel-type-timeline-year-active` | `.76cqw` | 共享 | 活动年份 |

Standard Atlas 明信片使用 `1.5` 家族缩放，因此显示字号也会整体等比缩放。主题 MUST NOT 通过独立选择无关内部字号来抵消它。

## 3. 层级规则

- 主操作 MUST 保持为最强的控件标签。
- 次级控件 SHOULD 更安静，但仍需清晰可读和可操作。
- Journey 与 Location 的图例标签 MUST 具有相同层级。
- 明信片标题 MUST 强于眉题、标签页、图注和元数据。
- 元数据值 SHOULD 强于元数据标签。
- 活动年份 MAY 只通过活动令牌和主题皮肤强调。
- 运行时本地化文本 MUST 保持可见；只有批准概念使用永久装饰文字且语义运行时标签仍可访问时才可例外。

## 4. 主题自由度

主题 MAY 改变：

- 字体家族与各语言后备字体。
- 颜色、渐变填充、描边、阴影、发光、纹理和混合处理。
- 在文本仍清晰时改变字重、斜体/正体、大小写和字距。
- 允许范围内的视觉缩放。

主题 MUST NOT：

- 引入任意角色字号。
- 根据栅格文字或透明边距确定字号。
- 仅为适配错误的资产安全区而缩小文字。
- 因无关资产含有烘焙文字而隐藏动态文本。
- 为解决字体问题而改变控件高度或文本区域几何。

## 5. 本地化与适配

英文与中文 MUST 使用相同语义角色令牌。语言特定的字体家族、字距或视觉缩放 MAY 在允许范围内不同。必须在参考视口和当前窄布局下验证最长的受支持标签。

文字不适配时，按以下顺序处理：

1. 确认几何家族和功能宽度正确。
2. 确认清单中的安全区和艺术适配方式。
3. 调整字距或批准的后备字体。
4. 应用受限视觉缩放。
5. 声明例外，而不是静默减小字号。

## 6. Deep Sea 参考证据

Deep Sea 建立当前 Standard Atlas 层级：`2.75cqw/.76cqw` 品牌标题/副标题、`1.065cqw` 主控件、`.96cqw` 次级语言控件、`.746cqw` 紧凑细节控件、`.852cqw` 图例文本、第 2 节所列明信片字号，以及 `.68/.76cqw` 时间线年份。其衬线字体选择、珍珠渐变、水蓝/金色、发光、阴影、大写处理和字距属于主题皮肤，MUST NOT 作为几何复制。

## 7. 验证

排版验证 MUST 在两种语言中检查计算字号、行高、溢出、裁切、对比度以及焦点/禁用状态。视觉对比 SHOULD 使用相同舞台尺寸，使 `cqw` 值可比较。
