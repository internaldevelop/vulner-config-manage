
export function IsEmptyObject(obj) {
  if (typeof obj === "undefined" || obj === null) {
    return true;
  } else {
    return false;
  }
}

/**
 * 不重复地添加新元素到数组
 * @param {Array} arr 
*/
export function PushNew(arr) {
  let eleCount = arguments.length;
  for (let i = 1; i < eleCount; i++) {
    let ele = arguments[i];
    if (arr.indexOf(ele) < 0)
      arr.push(ele);
  }
}

/**
 * 在数组中删除指定的元素
 * @param {Array} arr 
 */
export function DeleteElements(arr) {
  let eleCount = arguments.length;
  for (let i = 1; i < eleCount; i++) {
    let ele = arguments[i];
    let index = arr.indexOf(ele);
    if (index >= 0) {
      arr.splice(index, 1);
    }
  }
}

/**
 * 浅拷贝，不影响目标对象中不拷贝的属性
 * @deprecated
 * @param {Object} dest 存放待拷贝属性的目标对象
 * @param {Object} src 源对象
 */
export function CopyProps(dest, src) {
  if (IsEmptyObject(src) || IsEmptyObject(dest))
    return;

  for (var prop in src) {
    // if (dest.hasOwnProperty(prop)) 
    dest[prop] = src[prop];
  }
}

/**
 * 浅拷贝，不影响目标对象中不拷贝的属性
 * @param {Object} dest 存放待拷贝属性的目标对象
 * @param {Object} src 源对象
 */
export function ShallowCopy(dest, src) {
  Object.assign(dest, src);
}

/**
 * 深克隆，复制产生新对象
 * @param {Object} src 源对象
 * @return {Object} 拷贝产生的新对象
 */
export function DeepClone(src) {
  let dest = JSON.parse(JSON.stringify(src));
  return dest;
}

/**
 * 深拷贝，将源对象深拷贝到目标对象中，不影响目标对象中不拷贝的属性
 * @param {Object} dest 存放待拷贝属性的目标对象
 * @param {Object} src 源对象
 */
export function DeepCopy(dest, src) {
  // 对源对象克隆出一个新对象
  let clone = DeepClone(src);

  // 将克隆出的对象拷贝到目标对象中
  ShallowCopy(dest, clone);
}

/**
 * 校验是否含有特殊字符
*/
export function isContainSpecialCharacter(inputStr) {
  let pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
  if (pattern.test(inputStr)) {
    return true;
  }
  return false;
}

export function isContainSpecialCharacterForIP(inputStr) {
  let pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
  if (pattern.test(inputStr)) {
    return true;
  }
  return false;
}

// 由字母a～z(不区分大小写)、数字0～9、点、减号或下划线组成
// 只能以字母开头，包含字符 数字 下划线，例如：beijing.2008
// 用户名长度为4～18个字符
export function isValidAccount(account) {
  var patten = /^[a-zA-Z]\w{3,15}$/ig;
  if (!patten.test(account)) {
    return false;
  }
  return true;
}
