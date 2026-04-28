import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PopularDestinationCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <Image
        source={item.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={500}
      />
      {/* Dark gradient overlay */}
      <View style={styles.overlay} />
      {/* Bottom name label */}
      <View style={styles.labelWrap}>
        <Text style={styles.labelText} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "#FFD4B8",
    backgroundColor: "#FFE8D4",
    shadowColor: "#2D1B69",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45,27,105,0.18)",
  },
  labelWrap: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#FFD4B8",
    alignItems: "center",
  },
  labelText: {
    color: "#2D1B69",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
  },
});
