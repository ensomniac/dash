#!/usr/bin/python
#
# Ensomniac 2024 Ryan Martin, ryan@ensomniac.com
#             Andrew Stet, stetandrew@gmail.com

import os
import sys


class WorksheetUtils:
    def __init__(self, worksheet):
        self.worksheet = worksheet

        self.fonts = {}
        self.fills = {}
        self.sides = {}
        self.borders = {}

    def AutoSizeColumnsByContent(self, pad=2):
        from openpyxl.utils import get_column_letter

        # Auto-size columns based on content
        for column in self.worksheet.columns:
            max_length = 0
            column = [cell for cell in column if cell.value]

            for cell in column:
                try:
                    length = len(str(cell.value))
                    max_length = max(length, max_length)
                except:
                    pass

            self.worksheet.column_dimensions[get_column_letter(column[0].column)].width = (
                max_length + pad  # Adding a little extra space
            )

    def CenterTextVerticallyInAllCells(self, min_height=30, min_height_mults={}):
        from openpyxl.styles import Alignment

        alignment = Alignment(vertical="center")

        for row in self.worksheet.iter_rows():
            for cell in row:
                cell.alignment = alignment

            if (
                min_height
                and (
                    row[0].row not in self.worksheet.row_dimensions
                    or self.worksheet.row_dimensions[row[0].row].height < min_height
                )
            ):
                self.worksheet.row_dimensions[row[0].row].height = min_height * (
                    min_height_mults[row[0].row] if row[0].row in min_height_mults else 1
                )

    def SetCellValueByColumnIndex(self, row_num, column_index, value=""):
        for col_index, cell in enumerate(self.worksheet[row_num]):
            if col_index != column_index:
                continue

            cell.value = value

            break

    def StyleHeaderRow(self, bg_color="dcdfe3", font=None, border=None, fill=None):
        font, border, fill = self.assert_header_footer_params(bg_color, font, border, fill, header=True)

        self.StyleRow(self.worksheet, 1, font, border, fill)

    def StyleFooterRow(self, bg_color="dcdfe3", font=None, border=None, fill=None):
        font, border, fill = self.assert_header_footer_params(bg_color, font, border, fill)

        self.StyleRow(self.worksheet, self.worksheet.max_row, font, border, fill)

    def StyleRow(self, row_num, font=None, border=None, fill=None, bg_color="", font_type=""):
        if not fill and bg_color:
            fill = self.get_fill(bg_color)

        if not font and font_type:
            font = self.get_font(font_type)

        if not border:
            border = self.get_border("thin", "thin", "thin", "thin")

        for cell in self.worksheet[row_num]:
            if font:
                cell.font = font

            if fill:
                cell.fill = fill

            if border:
                cell.border = border

    def get_font(self, font_type):
        if not self.fonts.get(font_type):
            from openpyxl.styles import Font

            self.fonts[font_type] = Font(**{font_type: True})

        return self.fonts[font_type]

    def get_fill(self, start_color, end_color="", fill_type="solid"):
        key = f"{start_color}{end_color}{fill_type}"

        if not self.fills.get(key):
            from openpyxl.styles import PatternFill

            self.fills[key] = PatternFill(
                start_color=start_color,
                end_color=end_color or start_color,
                fill_type=fill_type
            )

        return self.fills[key]

    def get_side(self, style="thin"):
        if not self.sides.get(style):
            from openpyxl.styles import Side

            self.sides[style] = Side(style=style)

        return self.sides[style]

    def get_border(self, left="", right="", top="", bottom=""):
        key = f"{left}{right}{top}{bottom}"

        if not self.borders.get(key):
            from openpyxl.styles import Border

            self.borders[key] = Border(
                left=self.get_side(left),
                right=self.get_side(right),
                top=self.get_side(top),
                bottom=self.get_side(bottom)
            )

        return self.borders[key]

    def assert_header_footer_params(self, bg_color="dcdfe3", font=None, border=None, fill=None, header=False):
        if not fill:
            fill = self.get_fill(bg_color)

        if not font:
            font = self.get_font("bold")

        if not border:
            border = self.get_border(**{"bottom" if header else "top": "thin"})

        return font, border, fill
