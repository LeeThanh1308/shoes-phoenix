interface ISuccess {
  name: string;
  action: 'created' | 'updated' | 'deleted';
  state: boolean;
}

export function generateMessage(
  name: string,
  action: 'created' | 'updated' | 'deleted',
  state: boolean,
  customMessage = '',
): {
  message: string;
  type: boolean;
} {
  const stateMessage = customMessage
    ? customMessage
    : state
      ? 'thành công.'
      : 'thất bại.';
  switch (action) {
    case 'created':
      return {
        message: `Thêm ${name} ${stateMessage}`,
        type: state,
      };
    case 'updated':
      return {
        message: `Cập nhật ${name} ${stateMessage}`,
        type: state,
      };
    case 'deleted':
      return {
        message: `Xóa ${name} ${stateMessage}`,
        type: state,
      };
    default:
      return {
        message: `Errors ${name}`,
        type: state,
      };
  }
}
