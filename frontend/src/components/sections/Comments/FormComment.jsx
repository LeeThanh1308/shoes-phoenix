import { Button } from "antd";

function FormComment({ fullName }) {
  return (
    <div>
      <div className=" -mt-3 pb-3 text-2xl font-medium text-center border-b border-gray-300">
        <h2>Trả lời &quot;{fullName}&quot;</h2>
      </div>
      <div className=" font-normal text-base flex flex-col gap-2 p-3">
        <div className="flex justify-between gap-2">
          <div className=" flex-[0.5] h-14">
            <input
              type="text"
              className=" w-full h-full rounded-md border border-gray-300 placeholder:text-gray-500 outline-none px-2"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className=" flex-[0.5] h-14">
            <input
              type="text"
              className=" w-full h-full rounded-md border border-gray-300 placeholder:text-gray-500 outline-none px-2"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>
        <div className="h-14">
          <input
            type="text"
            className=" w-full h-full rounded-md border border-gray-300 placeholder:text-gray-500 outline-none px-2"
            placeholder="Nhập email (Không bắt buộc)"
          />
        </div>
        <div className="h-14">
          <input
            type="text"
            className=" w-full h-full rounded-md border border-gray-300 placeholder:text-gray-500 outline-none px-2"
            placeholder="Nhập nội dung trả lời (Vui lòng gõ tiếng việt có dấu)..."
          />
        </div>

        <Button
          type="primary"
          text="Gửi"
          className=" bg-blue-500 font-bold text-white"
        />
      </div>
    </div>
  );
}

export default FormComment;
