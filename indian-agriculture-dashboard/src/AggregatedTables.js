import React, { useEffect, useState } from 'react'
import { Table, Container } from '@mantine/core'

const AggregatedTables = () => {
  const [maxMinTable, setMaxMinTable] = useState([])
  const [avgTable, setAvgTable] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      // Dynamically import csvtojson to ensure it resolves correctly
      const csvModule = await import('csvtojson')
      const csv = csvModule.default

      const response = await fetch('/assets/India_Agro_Dataset_Cleaned.csv')
      const csvText = await response.text()
      const data = await csv().fromString(csvText)

      // Treat missing values as 0
      const cleanedData = data.map(row => {
        Object.keys(row).forEach(key => {
          if (row[key] === '' || row[key] === null || row[key] === undefined) {
            row[key] = 0
          }
        })
        return row
      })

      const maxMin = {}
      const cropStats = {}

      cleanedData.forEach(row => {
        const year = row.Year
        const crop = row['Crop Name']
        const production = parseFloat(row['Crop Production (UOM:t(Tonnes))'])
        const area = parseFloat(
          row['Area Under Cultivation (UOM:Ha(Hectares))']
        )
        const yieldCrop = parseFloat(
          row['Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))']
        )

        if (!maxMin[year]) {
          maxMin[year] = {
            maxCrop: crop,
            maxProduction: production,
            minCrop: crop,
            minProduction: production,
          }
        } else {
          if (production > maxMin[year].maxProduction) {
            maxMin[year].maxCrop = crop
            maxMin[year].maxProduction = production
          }
          if (production < maxMin[year].minProduction) {
            maxMin[year].minCrop = crop
            maxMin[year].minProduction = production
          }
        }

        if (!cropStats[crop]) {
          cropStats[crop] = { totalYield: 0, totalArea: 0, count: 0 }
        }
        cropStats[crop].totalYield += yieldCrop
        cropStats[crop].totalArea += area
        cropStats[crop].count += 1
      })

      const maxMinTableData = Object.keys(maxMin).map(year => ({
        year,
        maxCrop: maxMin[year].maxCrop,
        minCrop: maxMin[year].minCrop,
      }))

      const avgTableData = Object.keys(cropStats).map(crop => ({
        crop,
        avgYield: (cropStats[crop].totalYield / cropStats[crop].count).toFixed(
          3
        ),
        avgArea: (cropStats[crop].totalArea / cropStats[crop].count).toFixed(3),
      }))

      setMaxMinTable(maxMinTableData)
      setAvgTable(avgTableData)
    }

    fetchData()
  }, [])

  const renderMaxMinTable = () => (
    <Table>
      <thead>
        <tr>
          <th>Year</th>
          <th>Crop with Maximum Production</th>
          <th>Crop with Minimum Production</th>
        </tr>
      </thead>
      <tbody>
        {maxMinTable.map((row, index) => (
          <tr key={index}>
            <td>{row.year}</td>
            <td>{row.maxCrop}</td>
            <td>{row.minCrop}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )

  const renderAvgTable = () => (
    <Table>
      <thead>
        <tr>
          <th>Crop</th>
          <th>Average Yield (1950-2020)</th>
          <th>Average Cultivation Area (1950-2020)</th>
        </tr>
      </thead>
      <tbody>
        {avgTable.map((row, index) => (
          <tr key={index}>
            <td>{row.crop}</td>
            <td>{row.avgYield}</td>
            <td>{row.avgArea}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )

  return (
    <Container>
      <h1>Aggregated Crop Data</h1>
      <h2>Year-wise Crop Production</h2>
      {renderMaxMinTable()}
      <h2>Average Crop Yield and Area (1950-2020)</h2>
      {renderAvgTable()}
    </Container>
  )
}

export default AggregatedTables
