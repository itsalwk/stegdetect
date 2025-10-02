import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileImage, Clock } from "lucide-react";

const mockHistory = [
  {
    id: 1,
    filename: "secret_message.png",
    type: "Steganography",
    date: "2025-01-15 14:30",
    status: "Success"
  },
  {
    id: 2,
    filename: "suspect_image.jpg",
    type: "Steganalysis",
    date: "2025-01-15 12:15",
    status: "Detected"
  },
  {
    id: 3,
    filename: "hidden_data.png",
    type: "Steganography",
    date: "2025-01-14 09:45",
    status: "Success"
  },
  {
    id: 4,
    filename: "analysis_test.png",
    type: "Steganalysis",
    date: "2025-01-14 08:20",
    status: "Safe"
  },
  {
    id: 5,
    filename: "encrypted_msg.png",
    type: "Steganography",
    date: "2025-01-13 16:00",
    status: "Success"
  },
];

const History = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">History</h2>
        <p className="text-muted-foreground">View your recent steganography and analysis tasks</p>
      </div>

      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by filename..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your steganography and steganalysis history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileImage className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.filename}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge
                    variant={
                      item.status === "Success" || item.status === "Safe"
                        ? "default"
                        : item.status === "Detected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
