import { Button, Upload, message } from "antd";
import { memo, useEffect, useState } from "react";

import ImgCrop from "antd-img-crop";
import { UploadOutlined } from "@ant-design/icons";
import { urlToFile } from "@/services/utils";

function UploadImages({
  aspect = 16 / 9,
  quanlity = 1,
  listType = "picture",
  getData = () => {},
  defaultDataUrl = [],
  defaultDataFile = [],
  onDelete = () => {},
  typeImage = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/avif",
  ],
  maxSize = 2,
  restImage = () => {},
  title = "Upload Image",
  placeholder = "Upload picture",
  warn = "",
}) {
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    (async () => {
      if (
        fileList.length == 0 &&
        (defaultDataFile.length > 0 || defaultDataUrl.length > 0)
      ) {
        const defaultDataUrlToFile = await Promise.all(
          defaultDataUrl.map(async (it, ix) => {
            const file = await urlToFile(
              `${process.env.NEXT_PUBLIC_DOMAIN_API}${process.env.NEXT_PUBLIC_PARAM_GET_FILE_API}${it}`,
              false
            );
            return {
              uid: `${-ix - 1}${it}`,
              name: it,
              upload: false,
              status: "done",
              originFileObj: file,
              thumbUrl: URL.createObjectURL(file),
            };
          })
        );
        setFileList([
          ...defaultDataUrlToFile,
          ...defaultDataFile.map((file, index) => ({
            uid: `${-index - 1}`, // uid cần unique
            name: file.name,
            status: "done",
            originFileObj: file,
            thumbUrl: URL.createObjectURL(file),
          })),
        ]);
      }
    })();
  }, [defaultDataFile, defaultDataUrl]);

  useEffect(() => {
    const callBack = async () => {
      if (Array.isArray(fileList) && fileList.length > 0) {
        const result = fileList.filter((it) => it.originFileObj);
        const dataFile = await Promise.all(
          result.map((it) => it.originFileObj)
        );
        getData(dataFile, fileList);
      }
    };
    callBack();
  }, [fileList]);

  const onChange = ({ fileList: newFileList }) => {
    if (fileList.length > newFileList.length) {
      const result = window.confirm("Bạn chắc chắn muốn xóa ảnh này");
      if (result) {
        setFileList(newFileList);
        restImage(newFileList.map((it) => it.name));
        const dataRemoved = fileList.filter((it) =>
          it.status === "removed" ? it.name : null
        );
        if (Array.isArray(dataRemoved) && dataRemoved.length > 0)
          onDelete(dataRemoved[0].name);
      }
    } else if (fileList.length < newFileList.length) {
      const file = newFileList[fileList.length];
      console.log(file.type);
      const isJpgOrPng = typeImage.includes(file?.type);
      // console.log(isJpgOrPng);
      if (!isJpgOrPng) {
        message.error(`You can only upload ${typeImage.join(", ")} file!`);
      }
      const isLt1M = file.size / 1024 / 1024 < maxSize;
      // console.log(isLt1M);
      if (!isLt1M) {
        message.error(`Image must smaller than ${maxSize}MB!`);
      }
      if (isJpgOrPng && isLt1M) {
        setFileList(newFileList);
      }
    } else {
      setFileList(newFileList);
    }
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };
  return (
    <>
      <p
        htmlFor={title}
        className={`text-xs text-gray-500 ${warn && "text-rose-700"}`}
      >
        {title}
      </p>
      {/* <ImgCrop aspect={aspect} quality={quanlity}> */}
      <Upload
        listType={listType}
        maxCount={quanlity}
        className="w-fit"
        fileList={fileList}
        onChange={(data) => {
          onChange(data);
        }}
        onPreview={onPreview}
        customRequest={(options) => {
          const { file, onSuccess, onError } = options;
          onSuccess(file, file);
        }}
      >
        {fileList.length < +quanlity &&
          (["picture"].includes(listType) ? (
            <p>
              <Button icon={<UploadOutlined />}>{placeholder}</Button>
            </p>
          ) : (
            placeholder
          ))}
      </Upload>
      {/* </ImgCrop> */}
      {warn && (
        <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
          {warn}
        </p>
      )}
    </>
  );
}

export default memo(UploadImages);
