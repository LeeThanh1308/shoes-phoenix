function InputFormAdmin({
  title,
  className,
  warn,
  classNameDiv,
  children,
  ...args
}) {
  return (
    <div className={`mb-2 w-full relative mr-1 ${classNameDiv}`}>
      <label
        htmlFor={title}
        className={`text-xs text-gray-500 ${warn && "text-rose-700"}`}
      >
        {title}
      </label>
      <div className=" relative">
        <input
          id={title}
          className={`p-2 rounded-md w-full border border-solid border-blue-700 outline-none placeholder:text-blue-700 ${className}`}
          {...args}
        />
        {children}
      </div>
      <p className="text-rose-700 indent-1 warn w-full mb-1 text-start text-sm">
        {warn}
      </p>
    </div>
  );
}

export default InputFormAdmin;
