import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ChatCard from "../../components/form/ChatCard";

export default function Chatbot() {
    return (
        <div>
            <PageMeta
                title="MOGE Document Chatbot"
                description="MOGE Document Chatbot Page"
            />
            <PageBreadCrumb pageTitle="Chatbot" />
            <div className="flex justify-center items-center w-full">
                <div className="w-full max-w-7xl">
                    <ChatCard />
                </div>
            </div>
        </div>
    );
}
