import { Chart } from 'chart.js/auto'
import { useEffect, useRef } from 'react'
import Button from './Button.js'

export default function MapChart({ points, isActive, className, toggle }) {
    const chartRef = useRef(null)

    useEffect(()=>{
        
        const canvas = chartRef.current
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: points.map((row, index) => index),
                datasets: [{
                    label: 'Route elevation',
                    data: points.map(row => row.elevation),
                    fill: true,
                    backgroundColor: 'rgb(145, 198, 65)',
                    borderColor: 'rgb(145, 198, 65)',
                    tension: 0.6
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        suggestedMax: 1000,
                        grid: {
                            color: 'transparent'
                        }
                    },
                    x: {
                        grid: {
                            color: 'transparent'
                        }
                    }
                }
            }
        })

        return () => chart.destroy();
    }, [points])

    return (
        <div className={`p-8 ${className}`}>
            <div className='bg-white w-full md:w-2/3 p-8 rounded-lg relative'>
                <Button className='absolute top-8 right-8' action={ toggle } text="close" />
                <canvas ref={ chartRef } width="100%" className="chart"></canvas>
            </div>
        </div>
    )
}