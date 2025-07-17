function Responsive({children, className, ...props}) {
    return ( <div className={`w-full lt:w-[1280px] mx-auto ${className}`} {...props}>{children}</div> );
}

export default Responsive;