const Button = ({
  name,
  classname = "",
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
}) => {
  const buttonStyle =
    variant === "primary"
      ? "bg-primary border-primary"
      : variant === "outline"
        ? "bg-transparent border-white"
        : "";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[10px] border-[2px] px-4 py-2 font-poppins text-[16px] font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 sm:text-[17px] ${buttonStyle} ${classname}`}
    >
      {name}
    </button>
  );
};

export default Button;
