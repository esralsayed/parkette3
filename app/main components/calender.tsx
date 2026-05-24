import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/api/calender` || "http://localhost:5000/api/calendar";

const STATUS_COLORS: Record<string, string> = {
  completed: "#E7E1FF",
  missed: "#FF6B6B",
  favorite: "#FFD700",
};

export default function Calendar() {
  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState<string | null>(null);
  const [days, setDays] = useState<{ date: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load user from storage first
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || "User");
          setUserId(user.id || null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  // 2. Only fetch calendar once userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/${userId}`);
        const data = await response.json();
        setDays(data.days || []);
      } catch (error) {
        console.error("Error fetching calendar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [userId]); // re-fetches if userId changes

  if (loading) {
    return (
      <View style={{ padding: 16 }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView horizontal style={{ flexDirection: "row", padding: 16 }}>
      {days.map((day) => {
        // 3. Safe color lookup with fallback
        const bgColor = STATUS_COLORS[day.status] ?? "#EFEFEF";

        // 4. Parse date without timezone shift
        const [, , dayNum] = day.date.split("T")[0].split("-");

        return (
          <View
            key={day.date}
            style={{
              width: 60,
              height: 60,
              marginRight: 8,
              borderRadius: 12,
              backgroundColor: bgColor,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{parseInt(dayNum, 10)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}