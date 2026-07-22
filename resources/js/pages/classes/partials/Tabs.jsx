
import { useState } from "react";
import { router } from "@inertiajs/react";
import StudentTable from "../components/StudentTable";
import StudentProfile from "../../Profile/[id]";
import RecordedStreamsTab from "./recorded-streams/RecordedStreamsTab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";




export default function Tab({ classId, students = [], coach,  selectedStudent,
  setSelectedStudent, recordings = [], canUploadRecordings = false, }) {
  // const [selectedStudent, setSelectedStudent] = useState(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );

 

  return (
    <div className="bg-white rounded-2xl p-8 min-h-[400px] dark:bg-gradient-to-br dark:from-[#19160D] dark:via-[#14130F] dark:to-[#2A2206]">

      {selectedStudent ? (
        <StudentProfile
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="streams">Recorded Streams</TabsTrigger>
            <TabsTrigger value="Programme">Programme</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentTable
              students={filteredStudents}
              coach={coach}
              onSelectStudent={setSelectedStudent}
            />
          </TabsContent>

          <TabsContent value="streams">
            <RecordedStreamsTab
              canUpload={canUploadRecordings}
              classId={classId}
              recordings={recordings}
            />
          </TabsContent>

          <TabsContent value="Programme">
            <p>Coming soon</p>
          </TabsContent>

          <TabsContent value="resources">
            <p>Coming soon</p>
          </TabsContent>
        </Tabs>
      )}

    </div>
  );
}
