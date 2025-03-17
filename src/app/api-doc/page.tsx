import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <section className="flex flex-col h-screen w-screen bg-white">
      <ReactSwagger spec={spec}/>
    </section>
  );
}