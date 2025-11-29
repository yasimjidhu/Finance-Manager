import React from 'react';
import { Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { LightColors } from '../../theme/colors';

interface PieChartProps {
    data: {
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[];
}

export const PieChart = ({ data }: PieChartProps) => {
    const screenWidth = Dimensions.get("window").width;

    return (
        <RNPieChart
            data={data}
            width={screenWidth}
            height={220}
            chartConfig={{
                backgroundColor: LightColors.background,
                backgroundGradientFrom: LightColors.background,
                backgroundGradientTo: LightColors.background,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
        />
    );
};
