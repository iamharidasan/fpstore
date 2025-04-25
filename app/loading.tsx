import Image from "next/image"
import loader from "@/assets/loader.gif"

const Loading = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image src={loader} alt="Loading..." height={150} width={150} />
    </div>
  )
}

export default Loading
