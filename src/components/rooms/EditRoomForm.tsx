import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard.tsx";
import Label from "../form/Label.tsx";
import Input from "../form/input/InputField.tsx";
import { useNavigate, useParams } from "react-router";
import { Room } from "../../interfaces/room.ts";
import { roomApi } from "../../api/roomApi.ts";
import { toast } from "react-toastify";
import { Building } from "../../interfaces/building.ts";
import { helper } from "../../helpers/utils.ts";
import Select from "../form/Select.tsx";
import FieldError from "../form/FieldError.tsx";
import { useFormErrors } from "../../hooks/useFormErrors.ts";
import { parseApiError } from "../../helpers/parseApiError.ts";


const emptyRoom: Room = {
  id: 0,
  room_id:"",
  room_no:"",
  room_name:"",
  building_id:"",
};

export default function EditRoomForm() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { errors, validate } = useFormErrors<Room>();

  const [room, setRoom] = useState<Room>(emptyRoom);
  const [loading, setLoading] = useState(isEditMode);

  const [buildings, setBuildings] = useState<Building[]>([]);
  useEffect(()=>{
    const fetchBuildings = async() =>{
      const data = await helper.fetchBuildings();
      setBuildings(data);
    };

    fetchBuildings();
  }, [])

  const buildingOptions = buildings.map((b)=>({
    value:String(b.id),
    label:b.building_name,
  }))

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      const data = await roomApi.getById(id)
      setRoom(data.room);
      setLoading(false);
    };

    fetchRoom();
  }, [id]);

  const handleSubmit = async () => {
    const valid = validate([
      { field: "room_no", value: room.room_no, label: "Room No", required: true },
      { field: "room_name", value: room.room_name, label: "Room name", required: true },
      { field: "building_id", value: room.building_id, label: "Building", required: true },
    ]);
    if (!valid) return;

    try {
        const data = await roomApi.update(room);
        toast.success(data.message || "Updated successfully!");
        navigate("/rooms/");
    } catch (err: any) {
        toast.error(parseApiError(err, "Something went wrong!"));
    }
  };

  const handleSelectChange = (value:string)=>{
    setRoom({...room, building_id:value});
  };

  if (loading) return <p>Loading user...</p>;

  return (
    <ComponentCard title={"Edit Rooms"}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
            <Label>ID</Label>
            <Input type="text" value={room.id} disabled/>
        </div>

        <div>
          <Label>Room ID</Label>
          <Input type="text" value={room.room_id} 
            onChange={(e)=> setRoom({...room, room_id: e.target.value})}
          />
        </div>
        <div>
          <Label>Room No</Label>
          <Input
            type="text"
            value={room.room_no}
            onChange={(e) =>
              setRoom({ ...room, room_no: e.target.value })
            }
          />
          <FieldError message={errors.room_no} />
        </div>
        <div>
          <Label>Room Name</Label>
          <Input
            type="text"
            value={room.room_name}
            onChange={(e) =>
              setRoom({ ...room, room_name: e.target.value })
            }
          />
          <FieldError message={errors.room_name} />
        </div>
        <div>
          <Label>Building :</Label>
          <Select 
          options={buildingOptions}
          value={room.building_id}
          onChange={handleSelectChange}
          className="dark:bg-dark-900"
          />
          <FieldError message={errors.building_id} />
        </div>
        {/* Submit Button */}
        <div className="md:col-span-2 flex">
          <button
            onClick={handleSubmit}
            className="
              flex items-center gap-2
              px-4 py-2
              bg-gradient-to-r from-green-500 to-green-600
              text-white text-sm font-medium
              rounded-md
              shadow-sm
              hover:from-green-600 hover:to-green-700
              transition-all duration-200
              transform hover:-translate-y-0.5 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1
            "
          >
            {t("update")}
          </button>
        </div>

      </div>
    </ComponentCard>
  );
}
