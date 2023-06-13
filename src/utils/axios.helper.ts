/**
 * 返回数据格式化
 * @param result - 返回的数据
 * @param errno - 错误码，可选，默认为 0
 */
export const returnData = (result: any, errno = 0) => {
  if (result) {
    return {
      errno,
      data: result,
    };
  }
  return {
    errno,
    msg: '数据不存在',
  };
};
