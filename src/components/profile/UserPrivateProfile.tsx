import { Bookmark, LockKeyhole } from "lucide-react";
import PrivateDisplayPic from "./PrivateDisplayPic";

function UserPrivateProfile() {
  return (
    <div className="w-full h-[93vh]">
      <div className="max-w-[1248px] min-h-[184px] mx-auto flex bg-[#EEEEEE] p-[24px]">
        <div className="w-full h-full flex">
          <div className="w-[108px] h-full flex flex-col items-center gap-3">
            <PrivateDisplayPic variant="large" />
            <div className="w-[66px] h-[28px] bg-[#D9D9D9] rounded-r-full rounded-l-full"></div>
          </div>

          <div className="w-full flex flex-col gap-y-[16px] pl-3">
            <div className="max-w-[370px] h-[32px] bg-[#A4A4A4] rounded-[2px] "></div>
            <div className="max-w-[550px] h-[20px] bg-[#DCDCDC] rounded-[2px] "></div>
            <div className="max-w-[700px] h-[20px] bg-[#DCDCDC] rounded-[2px] "></div>
          </div>
        </div>
        <div></div>
        <Bookmark stroke="#8C8A8A" fill="#F9FAFB" strokeWidth={1.5} />
      </div>
      <div className="w-fit pt-[32px] mx-auto flex flex-col items-center gap-4">
        <LockKeyhole
          className="w-[108px] h-[108px]"
          stroke="#8C8A8A"
          strokeWidth={1.4}
        />
        <h2 className="text-3xl font-bold text-[#797979]">
          This account is private
        </h2>
      </div>
    </div>
  );
}

export default UserPrivateProfile;
