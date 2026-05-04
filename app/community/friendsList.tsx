import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Footer from "../components/Footer";
import NavBar from "../components/navbar";
const { width, height } = Dimensions.get("window");
export default function CommunityLanding() {
  return (
    <View style={styles.container}>
      <NavBar />

      <View style={styles.main}>
        <View style={[{alignContent:"center"}]}>
            <Text style={[{...AppFonts.title, fontSize:AppFontSizes.title,
                color: AppColors.blue, marginTop: 20
            }]}>My friends</Text>
        </View>
        
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lilac,
  },

  main: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
    flexDirection: "column",
    alignContent: "center"
  },

});