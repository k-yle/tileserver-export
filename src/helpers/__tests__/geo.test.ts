import { XYZToLatLng, latLngToXYZ } from "../geo";

describe("latLngToXYZ", () => {
  it.each`
    lat         | lng          | x         | y         | z
    ${-36.8635} | ${174.76219} | ${4036}   | ${2499}   | ${12}
    ${-36.8635} | ${174.76219} | ${32291}  | ${19998}  | ${15}
    ${-36.8635} | ${174.76219} | ${258329} | ${159985} | ${18}
  `("correctly converts ($lat, $lng) to $z/$x/$y", ({ lat, lng, x, y, z }) => {
    expect(latLngToXYZ(lat, lng, z)).toStrictEqual([x, y, z]);
  });
});

describe("XYZToLatLng", () => {
  it.each`
    x         | y         | z     | lat                   | lng
    ${4036}   | ${2499}   | ${12} | ${-36.80928470205938} | ${174.7265625}
    ${32291}  | ${19998}  | ${15} | ${-36.86204269508727} | ${174.759521484375}
    ${258329} | ${159985} | ${18} | ${-36.86314143295288} | ${174.76089477539062 /* eslint-disable-line @typescript-eslint/no-loss-of-precision */}
  `("correctly converts $z/$x/$y to ($lat, $lng)", ({ lat, lng, x, y, z }) => {
    expect(XYZToLatLng(x, y, z)).toStrictEqual([lat, lng]);
  });
});

describe("latLngToXYZ + XYZToLatLng", () => {
  it.each`
    lat         | lng          | z     | latDiff                   | lngDiff
    ${-36.8635} | ${174.76219} | ${12} | ${-0.05421529794062252}   | ${0.03562750000000392}
    ${-36.8635} | ${174.76219} | ${15} | ${-0.001457304912733548}  | ${0.00266851562500392}
    ${-36.8635} | ${174.76219} | ${18} | ${-0.0003585670471224489} | ${0.00129522460937892}
  `(
    "can undo the transformation for ($lat, $lng) @ $z",
    ({ lat, lng, z, latDiff, lngDiff }) => {
      const [x, y] = latLngToXYZ(lat, lng, z);
      const [latOut, lngOut] = XYZToLatLng(x, y, z);
      expect([lat - latOut, lng - lngOut]).toStrictEqual([latDiff, lngDiff]);
    }
  );
});
