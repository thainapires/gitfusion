import { FaGithub, FaPlus } from "react-icons/fa";
import { FaGitlab } from "react-icons/fa6";
import UserInformationForm from "./components/UserInformationForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
      <div className="container px-4">
        <div className="text-center mb-10">
          <div className="flex mx-auto justify-center items-center align-items-center gap-4">
            <FaGithub className="h-12 w-12 mb-5 text-zinc-400"/>
            <FaPlus className="text-zinc-400"/>
            <FaGitlab className="h-12 w-12 mb-5 text-zinc-400"/>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-300 mb-4">
            Git Fusion
          </h1>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
            Visualize your Github and Gitlab contributions in one graph
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
            <UserInformationForm />
          </div>
        </div>
      </div>
    </div>
  );
}
