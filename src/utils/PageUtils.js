

export function GetBodyWidth() {
    return window.innerWidth;
}

export function GetBodyHeight() {
    return window.innerHeight;
}

/**
 * 获取主视窗的宽度：
 * 浏览器窗口宽度 - （左侧导航宽度 + margins）
 * 如果浏览器宽度过小，直接返回浏览器窗口宽度
 */
export function GetMainViewWidth() {
    let bodyWidth = GetBodyWidth();
    return (bodyWidth > 600) ? bodyWidth - 330 : bodyWidth;
}

/**
 * 获取主视窗的高度：
 * 浏览器窗口高度 - （上侧 header + 下侧footer + margins）
 * 如果浏览器高度过小，直接返回浏览器窗口高度
 */
export function GetMainViewHeight() {
    let bodyHeight = GetBodyHeight();
    return (bodyHeight > 600) ? bodyHeight - 330 : bodyHeight;
}

/**
 * 主窗口（或内容窗口，承载系统主要功能的界面）
 * 最小高度
 */
export function GetMainViewMinHeight() {
    return 600;
}

/**
 * 主窗口（或内容窗口，承载系统主要功能的界面）
 * 最小宽度
 */
export function GetMainViewMinWidth() {
    return 800;
}
