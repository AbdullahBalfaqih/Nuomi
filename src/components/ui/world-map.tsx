'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, Graticule, Marker } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapData {
    country: string;
    value: number;
    code: string;
}

interface WorldMapProps {
    data: MapData[];
}

export const WorldMap: React.FC<WorldMapProps> = ({ data }) => {
    const [geographies, setGeographies] = useState<any[]>([]);

    useEffect(() => {
        fetch(geoUrl)
            .then(res => res.json())
            .then(data => {
                setGeographies(data.features);
            });
    }, []);

    const maxValue = useMemo(() => {
        if (!data || data.length === 0) return 0;
        return Math.max(...data.map(d => d.value));
    }, [data]);

    const getColor = (value: number) => {
        if (maxValue === 0) return "#DDD";
        const intensity = value / maxValue;
        // hsl(var(--primary)) is 168 76% 42%
        const hue = 168;
        const saturation = 76;
        const lightness = 90 - (intensity * 50); // from 90% (light) to 40% (dark)
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    
    const countryData = useMemo(() => {
        const map = new Map<string, number>();
        if (data) {
            data.forEach(item => {
                map.set(item.code, item.value);
            });
        }
        return map;
    }, [data]);


    if (!geographies || geographies.length === 0) {
        return <div className="w-full h-[400px] bg-background animate-pulse" />;
    }

    return (
        <div className="w-full h-[400px] bg-background">
            <ResponsiveContainer width="100%" height="100%">
                 <ComposableMap projection="geoMercator" projectionConfig={{ scale: 160 }} >
                    <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
                    <Geographies geography={geographies}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryValue = countryData.get(geo.properties.ISO_A2) || 0;
                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={countryValue > 0 ? getColor(countryValue) : "#F5F5F5"}
                                        stroke="#FFF"
                                        style={{
                                            default: { outline: 'none' },
                                            hover: { outline: 'none', fill: 'hsl(var(--primary))' },
                                            pressed: { outline: 'none' },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                    {data && data.map(({ country, value, code }) => {
                        const geo = geographies.find(g => g.properties.ISO_A2 === code);
                        if (!geo) return null;
                        
                        const centroid = geoCentroid(geo);
                        
                        return (
                            <Marker key={country} coordinates={centroid}>
                                <circle r={2 + (value / maxValue) * 8} fill="hsla(var(--primary), 0.5)" stroke="#fff" strokeWidth={1} />
                            </Marker>
                        )
                    })}
                </ComposableMap>
            </ResponsiveContainer>
        </div>
    );
};
