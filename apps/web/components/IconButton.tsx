export function IconButton({ icon, onClick, activated }: any) {
  return (
    <button
      className={`p-1.5 m-1 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-center ${
        activated 
          ? "bg-gray-900 text-white shadow-sm" 
          : "text-gray-900 hover:bg-gray-100 active:bg-gray-900 active:text-white active:scale-95" 
      }`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}