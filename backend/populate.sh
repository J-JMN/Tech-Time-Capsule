echo "Starting massive data population from 2000 to 2024..."
echo "This will take a long time. Please be patient."

for year in $(seq 2000 2024); do
  echo "----------------------------------------------------"
  echo "FETCHING DATA FOR YEAR: $year"
  echo "----------------------------------------------------"
  flask populate_db_year "$year" --fast
done

echo "All full years have been populated!"