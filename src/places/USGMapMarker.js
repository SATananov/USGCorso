import { StyleSheet, Text, View } from 'react-native';

import { getPlaceMarkerKind } from './placeMarkers';

const GOLD = '#d4af37';
const DARK = '#070708';

function PawIcon({ small = false }) {
  const scale = small ? 0.78 : 1;

  return (
    <View style={[styles.paw, { transform: [{ scale }] }]}>
      <View style={styles.pawPad} />
      <View style={[styles.pawToe, styles.pawToe1]} />
      <View style={[styles.pawToe, styles.pawToe2]} />
      <View style={[styles.pawToe, styles.pawToe3]} />
      <View style={[styles.pawToe, styles.pawToe4]} />
    </View>
  );
}

function CrossIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.crossVertical} />
      <View style={styles.crossHorizontal} />
    </View>
  );
}

function TreeIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.treeCrownLarge} />
      <View style={styles.treeCrownLeft} />
      <View style={styles.treeCrownRight} />
      <View style={styles.treeTrunk} />
    </View>
  );
}

function HouseIcon({ bed = false }) {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.houseRoof} />
      <View style={styles.houseBody}>
        {bed ? <View style={styles.houseBed} /> : <View style={styles.houseDoor} />}
      </View>
    </View>
  );
}

function TransportIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.vanBody} />
      <View style={styles.vanCab} />
      <View style={[styles.vanWheel, styles.vanWheelLeft]} />
      <View style={[styles.vanWheel, styles.vanWheelRight]} />
    </View>
  );
}

function WalkingIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.pathLine, styles.pathLineLeft]} />
      <View style={[styles.pathLine, styles.pathLineRight]} />
      <View style={styles.pathDot} />
    </View>
  );
}

function FoodIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.forkStem} />
      <View style={[styles.forkTooth, styles.forkTooth1]} />
      <View style={[styles.forkTooth, styles.forkTooth2]} />
      <View style={[styles.forkTooth, styles.forkTooth3]} />
      <View style={styles.knife} />
    </View>
  );
}

function TrainerIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.whistleBody} />
      <View style={styles.whistleHole} />
      <View style={styles.whistleStem} />
    </View>
  );
}

function ShelterIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.shelterRoof} />
      <View style={styles.shelterBody}>
        <PawIcon small />
      </View>
    </View>
  );
}

function BreederIcon() {
  return (
    <View style={styles.iconFrame}>
      <View style={styles.crestRing}>
        <Text style={styles.crestText}>CC</Text>
      </View>
    </View>
  );
}

function MarkerIcon({ category }) {
  const kind = getPlaceMarkerKind(category);

  if (kind === 'medical') return <CrossIcon />;
  if (kind === 'paw' || kind === 'dogPark') return <PawIcon />;
  if (kind === 'park') return <TreeIcon />;
  if (kind === 'hotel' || kind === 'stay') return <HouseIcon />;
  if (kind === 'boarding') return <HouseIcon bed />;
  if (kind === 'transport') return <TransportIcon />;
  if (kind === 'walking') return <WalkingIcon />;
  if (kind === 'food') return <FoodIcon />;
  if (kind === 'trainer') return <TrainerIcon />;
  if (kind === 'shelter') return <ShelterIcon />;
  if (kind === 'breeder') return <BreederIcon />;

  if (kind === 'grooming') {
    return <Text style={styles.symbolText}>✂</Text>;
  }

  if (kind === 'pharmacy') {
    return <Text style={styles.rxText}>Rx</Text>;
  }

  return <Text style={styles.fallbackText}>USG</Text>;
}

export default function USGMapMarker({
  category,
  selected = false,
  verified = false,
}) {
  return (
    <View style={[styles.markerWrap, selected && styles.markerWrapSelected]}>
      <View
        style={[
          styles.markerHead,
          selected && styles.markerHeadSelected,
          verified && styles.markerHeadVerified,
        ]}
      >
        <MarkerIcon category={category} />
        {verified ? <View style={styles.verifiedDot} /> : null}
      </View>
      <View style={[styles.markerTip, selected && styles.markerTipSelected]} />
      <View style={[styles.markerGlow, selected && styles.markerGlowSelected]} />
    </View>
  );
}

const styles = StyleSheet.create({
  markerWrap: {
    width: 52,
    height: 66,
    alignItems: 'center',
  },
  markerWrapSelected: {
    transform: [{ scale: 1.12 }],
  },
  markerHead: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DARK,
    borderWidth: 3,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GOLD,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  markerHeadSelected: {
    borderWidth: 4,
    shadowOpacity: 0.95,
    shadowRadius: 13,
    elevation: 13,
  },
  markerHeadVerified: {
    borderColor: '#f1cf64',
  },
  markerTip: {
    width: 18,
    height: 18,
    marginTop: -8,
    backgroundColor: DARK,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  markerTipSelected: {
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  markerGlow: {
    width: 8,
    height: 8,
    marginTop: 1,
    borderRadius: 4,
    backgroundColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 6,
  },
  markerGlowSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowRadius: 8,
  },
  verifiedDot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: DARK,
    backgroundColor: '#f1cf64',
  },
  iconFrame: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  symbolText: {
    color: GOLD,
    fontSize: 21,
    fontWeight: '900',
  },
  rxText: {
    color: GOLD,
    fontSize: 15,
    fontWeight: '900',
  },
  fallbackText: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  crossVertical: {
    position: 'absolute',
    width: 7,
    height: 24,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 24,
    height: 7,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  paw: {
    width: 25,
    height: 25,
    position: 'relative',
  },
  pawPad: {
    position: 'absolute',
    left: 7,
    top: 10,
    width: 12,
    height: 11,
    borderRadius: 7,
    backgroundColor: GOLD,
  },
  pawToe: {
    position: 'absolute',
    width: 6,
    height: 7,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
  pawToe1: {
    left: 1,
    top: 6,
  },
  pawToe2: {
    left: 6,
    top: 1,
  },
  pawToe3: {
    right: 6,
    top: 1,
  },
  pawToe4: {
    right: 1,
    top: 6,
  },
  treeCrownLarge: {
    position: 'absolute',
    top: 2,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: GOLD,
  },
  treeCrownLeft: {
    position: 'absolute',
    left: 3,
    top: 9,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GOLD,
  },
  treeCrownRight: {
    position: 'absolute',
    right: 3,
    top: 9,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GOLD,
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 1,
    width: 5,
    height: 10,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  houseRoof: {
    position: 'absolute',
    top: 2,
    width: 18,
    height: 18,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  houseBody: {
    position: 'absolute',
    bottom: 2,
    width: 19,
    height: 14,
    borderWidth: 3,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  houseDoor: {
    width: 5,
    height: 8,
    backgroundColor: GOLD,
  },
  houseBed: {
    width: 12,
    height: 5,
    marginBottom: 2,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  vanBody: {
    position: 'absolute',
    left: 2,
    top: 8,
    width: 16,
    height: 11,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  vanCab: {
    position: 'absolute',
    right: 2,
    top: 11,
    width: 9,
    height: 8,
    borderTopRightRadius: 3,
    backgroundColor: GOLD,
  },
  vanWheel: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: DARK,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  vanWheelLeft: {
    left: 6,
  },
  vanWheelRight: {
    right: 5,
  },
  pathLine: {
    position: 'absolute',
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  pathLineLeft: {
    left: 8,
    transform: [{ rotate: '16deg' }],
  },
  pathLineRight: {
    right: 8,
    transform: [{ rotate: '-16deg' }],
  },
  pathDot: {
    position: 'absolute',
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  forkStem: {
    position: 'absolute',
    left: 7,
    top: 7,
    width: 3,
    height: 18,
    backgroundColor: GOLD,
  },
  forkTooth: {
    position: 'absolute',
    top: 2,
    width: 2,
    height: 8,
    backgroundColor: GOLD,
  },
  forkTooth1: {
    left: 4,
  },
  forkTooth2: {
    left: 8,
  },
  forkTooth3: {
    left: 12,
  },
  knife: {
    position: 'absolute',
    right: 5,
    top: 2,
    width: 4,
    height: 23,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  whistleBody: {
    position: 'absolute',
    left: 4,
    top: 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 4,
    borderColor: GOLD,
  },
  whistleHole: {
    position: 'absolute',
    left: 9,
    top: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  whistleStem: {
    position: 'absolute',
    right: 2,
    top: 7,
    width: 11,
    height: 5,
    borderRadius: 2,
    backgroundColor: GOLD,
    transform: [{ rotate: '-15deg' }],
  },
  shelterRoof: {
    position: 'absolute',
    top: 2,
    width: 17,
    height: 17,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: GOLD,
    transform: [{ rotate: '45deg' }],
  },
  shelterBody: {
    position: 'absolute',
    bottom: 1,
    width: 20,
    height: 15,
    borderWidth: 3,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crestRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
