import { AdMobBanner } from "expo-ads-admob";
import { View, Text } from "react-native";
import { useState } from "react";

export default function AdBanner() {
  const [adError, setAdError] = useState(null);

  return (
    <View style={{ alignItems: "center", marginTop: 10 }}>
      {adError && <Text style={{ color: "red" }}>{adError}</Text>}
      <AdMobBanner
        bannerSize="smartBanner"
        adUnitID="ca-app-pub-4055906809006000/8442313400"
        onDidFailToReceiveAdWithError={(error) => {
          console.log(error);
          setAdError("Reklam yüklenirken bir hata oluştu.");
        }}
      />
    </View>
  );
}
