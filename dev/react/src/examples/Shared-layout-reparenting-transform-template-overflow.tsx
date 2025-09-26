import { motion, useCycle } from "framer-motion"

const Child = () => {
    return (
        <motion.div
            layoutId="big"
            style={{
                width: "148px",
                height: "148px",
                overflow: "clip",
                borderRadius: "20px",
                position: "absolute",
                top: "97px",
                left: "26px",
                backgroundColor: "rgba(0, 153, 255, 0.3)",
            }}
        >
            <motion.div
                layoutId="small"
                style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                    position: "absolute",
                    backgroundColor: "#0099ff",
                    top: "15px",
                    left: "15px",
                }}
            />
        </motion.div>
    )
}

const Sibling = () => {
    return (
        <>
            <motion.div
                layoutId="big"
                style={{
                    width: "148px",
                    height: "148px",
                    overflow: "clip",
                    borderRadius: "20px",
                    position: "absolute",
                    top: "137px",
                    left: "26px",
                    backgroundColor: "rgba(136, 85, 255, 0.3)",
                }}
            />
            <motion.div
                layoutId="small"
                style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "10px",
                    position: "absolute",
                    backgroundColor: "#85f",
                    top: "64px",
                    left: "124px",
                }}
            />
        </>
    )
}

export const App = () => {
    const [isOn, toggleOn] = useCycle(false, true)

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "static",
                backgroundColor: "#f3f3f3",
            }}
            onClick={() => toggleOn()}
        >
            {isOn ? <Child /> : <Sibling />}
        </div>
    )
}
