import csv

with open('2015_q2_data_for_web_final.csv', 'r') as f:
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
    
    peak_to_current = '%.1f' % (float(changeified_row[-1]) - float(max(changeified_row)))
    peak_to_bottom = '%.1f' % (float(min(changeified_row)) - float(max(changeified_row)))
    change_since_base = '%.1f' % (float(changeified_row[-1]) - float(changeified_row[baseline_index]))
    bottom_to_current = '%.1f' % (float(changeified_row[-1]) - float(min(changeified_row)))

    changeified_row.extend([peak_to_current, 
                            peak_to_bottom, 
                            change_since_base, 
                            bottom_to_current])
    
    changeified_row = ['%.1f' % float(i) for i in changeified_row]

    changes.append(changeified_row)

changes_header = ['Change Peak to Current', 
                  'Change Peak to Bottom', 
                  'Change Since 2000',
                  'Change Bottom to Current']

header = ['PumaID', 'Name'] + quarters + changes_header
rows_plus_names = []
for index, row in enumerate(changes):
    row = [puma_ids[index], puma_names[index]] + row
    rows_plus_names.append(row)
    

with open('cook_puma_trend_by_quarter_q2.csv', 'w') as outp:
    writer = csv.writer(outp)
    writer.writerow(header)
    writer.writerows(rows_plus_names)

