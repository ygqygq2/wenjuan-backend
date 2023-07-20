export enum Errno {
  // 定义 2 个 ERRNO MSG
  SUCCESS = 0,
  ERRNO_10 = 10,
  ERRNO_11 = 11,
  ERRNO_12 = 12,
  ERRNO_13 = 13,
  ERRNO_20 = 20,
  ERRNO_21 = 21,
}

export const ErrMsg: Record<Errno, string> = {
  [Errno.SUCCESS]: '成功',
  [Errno.ERRNO_10]: '保存失败',
  [Errno.ERRNO_11]: '复制失败',
  [Errno.ERRNO_12]: '查询失败',
  [Errno.ERRNO_13]: '删除失败',
  [Errno.ERRNO_20]: '注册失败',
  [Errno.ERRNO_21]: '登录失败',
};
