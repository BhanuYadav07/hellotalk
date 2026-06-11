
import { useApp } from "../../contexts/AppContext";
function Toast() {
  const { toastMsg, toastVisible } = useApp();
  return <div className={`toast${toastVisible ? " show" : ""}`}>{toastMsg}</div>;
}
export default Toast;