import csv

with open('2019_q2_price_index_by_quarter.csv', 'r') as f:
    reader = csv.reader(f)

    puma_ids = next(reader)[1:]
    puma_ids = [i[1:].zfill(5) for i in puma_ids]
    puma_names = next(reader)[1:]

    rotated_rows = [[] for i in range(len(puma_ids) + 1)]

    for row in reader:
        for cell_index, cell in enumerate(row):
            rotated_rows[cell_index].append(cell)

quarters = rotated_rows.pop(0)

baseline_index = quarters.index('2000Q1')
changes = []

for row in rotated_rows:
    changeified_row = []
    for index, cell in enumerate(row):
        if index == baseline_index:
            changeified_row.append(0)
        else:
            change = (float(cell) - float(row[baseline_index]))
            changeified_row.append(change)
    
    changeified_row = ['%.1f' % float(i) for i in changeified_row]

    changes.append(changeified_row)


rows_plus_names = []
for index, row in enumerate(changes):
    row = [puma_ids[index], puma_names[index]] + row
    rows_plus_names.append(row)
    
row_mapper = {}
for row in rows_plus_names:
    row_mapper[row[0]] = row

rows_with_summary = []
with open('2019_q2_price_index_summary.csv', 'r') as f:
    reader = csv.reader(f)

    next(reader)

    for row in reader:
        puma_id = row[0][1:].zfill(5)
        try:
            full_row = row_mapper[puma_id]

            # ignore the first 2 columns and chop off the % sign
            full_row.extend([i[:-1] for i in row[2:]])
            rows_with_summary.append(full_row)
        except KeyError:
            break

summary_header = ['Change Since 2000',
                  'Change Peak to Current',
                  'Change Bottom to Current',
                  'Year-over-year change',
                  'Quarter-over-quarter change']

header = ['PumaID', 'Name'] + quarters + summary_header

with open('cook_puma_trend_by_quarter.csv', 'w') as outp:
    writer = csv.writer(outp)
    writer.writerow(header)
    writer.writerows(rows_with_summary)


