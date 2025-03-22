
export default function GetStartedButton() {
    return (
        <button 
            className="relative flex items-center py-[0.4rem] px-8 overflow-hidden font-medium transition-all bg-primary rounded-md group cursor-pointer"
            onClick={() => window.location.href = '/dashboard'}
        >           
            <span className="absolute bottom-0 left-0 w-full h-full transition-all duration-500 ease-in-out delay-200 -translate-x-full bg-violet-600 rounded-md group-hover:translate-x-0"></span>
            <span className="relative w-full text-left text-white transition-colors duration-200 ease-in-out group-hover:text-white">
                Get Started
            </span>
        </button>
    )
}


