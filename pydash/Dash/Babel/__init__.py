#!/usr/bin/python
#
# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

"""
When working with any .py, .cs or .js file, if you include a BABLEDASH comment
at the top of the file with a pointer to the location of a different language
variation, Dash will auto compile a version of the source code in the destination language

Example usage at the top of a Javascript file:
//
// BABLEDASH -> ~/.../AuthenticPerformanceApi/authentic_performance_api.py
// BABLEDASH -> ~/ape_core/.../AuthenticPerformanceAPI/AuthenticPerformanceAPI.cs

^ This will auto generate python and C# variations of the
Javascript source whenever the source is modified
"""

import os
import sys
import json

from getpass import getuser
from datetime import datetime
from Dash.Utils import Utils as DashUtils


# TODO: Move this class to its own file
class DashBabelProperty:
    def __init__(self, property_name, default_property_value):
        self.property_name = property_name
        self.default_property_value = default_property_value

    @property
    def Name(self):
        return self.property_name

    @property
    def DefaultValue(self):
        return self.default_property_value

    @property
    def Type(self):
        return str

    def GetType(self):
        if self.Type == str:
            return "string"
        else:
            print("Error: Types not implemented yet")


# TODO: Move this class to its own file
class DashBabelClass:
    def __init__(self, name, inputs, functions, lines):
        self.name = name
        self.inputs = inputs
        self.functions = functions
        self.lines = lines

    @property
    def Javascript(self):
        print("Class conversion for Javascript not implemented yet")
        lines = []
        return lines

    @property
    def CSharp(self):
        lines = [
            "[System.Serializable]",
            "public class " + self.name + " {",
            ""
        ]

        # init = "    def __init__(self"
        inputs = []

        for babel_property in self.inputs:

            input_str = babel_property.GetType() + " "
            input_str += babel_property.Name

            if babel_property.DefaultValue != "":
                input_str += "=" + json.dumps(babel_property.DefaultValue)

            inputs.append(input_str)

        #     print(babel_property.DefaultValue)
        #     if babel_property.DefaultValue != "":
        #         init += "=" + str(babel_property.DefaultValue)

        # init += "):"

        # lines.append(init)

        inputs = ", ".join(inputs)

        lines.append("    public " + self.name + "(" + inputs + ") {")
        lines.append("    }")

        lines.append("")
        lines.append("}")

        return lines

    def convert_functions(self):
        pass

    @property
    def Python(self):
        init = "    def __init__(self"
        lines = ["class " + self.name + ":"]

        for babel_property in self.inputs:
            init += ", " + babel_property.Name

            print(babel_property.DefaultValue)

            if babel_property.DefaultValue != "":
                init += "=" + str(babel_property.DefaultValue)

        init += "):"

        lines.append(init)
        lines.append(init)

        return lines

    def ConvertTo(self, output_io):
        lines = []

        if output_io.Language.ext == "py":
            lines = self.Python
        elif output_io.Language.ext == "cs":
            lines = self.CSharp
        elif output_io.Language.ext == "js":
            lines = self.Javascript
        else:
            print("Unhandled ext")

        return lines


# TODO: Move this class to its own file
class DashBabelLanguage:
    def __init__(self, ext, display_name, comment_style):
        self.ext = ext
        self.display_name = display_name
        self.comment_style = comment_style

    @property
    def DisplayName(self):
        return self.display_name

    def GetClass(self, io, line):
        # Check to see if this line is a class
        print("WARNING: Not Implemented Yet: Language: " + self.DisplayName)
        return False

    def GetOutputHeader(self):
        lines = []

        header = self.comment_style + " Dash Babel Generated Code on "
        header += DashUtils.FormatTime(datetime.now())
        header += " by " + getuser().upper()

        lines.append(header)
        lines.append(self.comment_style)
        lines.append("")

        return lines


class DashBabelLanguagePY(DashBabelLanguage):
    def __init__(self):
        DashBabelLanguage.__init__(self, "py", "Python", "#")


class DashBabelLanguageCS(DashBabelLanguage):
    def __init__(self):
        DashBabelLanguage.__init__(self, "cs", "C#", "//")


class DashBabelFunction:
    def __init__(self, name, inputs, lines):
        self.name = name
        self.inputs = inputs
        self.lines = lines


class DashBabelLanguageJS(DashBabelLanguage):
    def __init__(self):
        DashBabelLanguage.__init__(self, "js", "Javascript", "//")

    def GetClass(self, io, line):
        # Check to see if this line is a class
        if not line.startswith("function "):
            return False

        line = line.strip()
        class_name = line.split("function ")[-1].split("(")[0].strip()
        inputs = self.parse_line_inputs(line)

        class_lines = []

        for ln in io.SourceContent:
            if len(class_lines) == 0:
                # Searching for the first line
                if line == ln:
                    print("START")
                    print(ln)
                    class_lines.append(ln)

                continue

            if ln.startswith("}"):
                print("END")
                print(ln)
                class_lines.append(ln)
                break

            class_lines.append(ln)

        functions = self.get_functions(class_lines)

        babel_class = DashBabelClass(class_name, inputs, functions, class_lines)

        # line.split("(")[-1].split(")")[0].replace(",", " ").split()

        # print(class_name)
        # print(inputs)
        # print()

        return babel_class

    def get_functions(self, class_lines):
        functions = []

        function_name = None
        function_inputs = []
        function_lines = []

        for line in class_lines:

            if not function_name:
                # Searching for a function

                if not line.startswith("    this."):
                    continue

                if "function(" not in line:
                    continue

                function_name = line.split("this.")[-1].split()[0].strip()
                function_inputs = self.parse_line_inputs(line)
                function_lines.append(line)
                continue

            if line.startswith("    };"):
                function_lines.append(line)

                functions.append(DashBabelFunction(
                    function_name,
                    function_inputs,
                    function_lines
                ))

                function_name = None
                function_inputs = []
                function_lines = []
                continue

            function_lines.append(line)

        return functions

    def parse_line_inputs(self, line):
        inputs = []

        for item in line.split("(")[-1].split(")")[0].replace(",", " ").split():
            property_name = item.split("=")[0].strip()
            default_value = ""

            if "=" in item:
                default_value_str = item.strip().split("=")[-1].strip()

                try:
                    default_value = json.loads(default_value_str)
                except:
                    sys.exit(f"****FAILED TO PARSE{line}>{default_value_str}")

            inputs.append(DashBabelProperty(property_name, default_value))

        return inputs


# TODO: Move this class to its own file
class DashBabelUtils:
    def __init__(self, source_path):
        self.source_path = source_path

        self.exts = ["py", "js", "cs"]


# TODO: Move this class to its own file
class DashBabelIO:
    _source_content: list[str]

    def __init__(self, source_path):
        self.source_path = source_path.strip()
        self.ext = self.source_path.split(".")[-1].strip().lower()
        self.language = self.get_language()

    def get_language(self):
        if self.ext == "js":
            return DashBabelLanguageJS()
        elif self.ext == "cs":
            return DashBabelLanguageCS()
        elif self.ext == "py":
            return DashBabelLanguagePY()
        else:
            sys.exit("ERROR: Invalid ext: " + self.ext)

    @property
    def Language(self):
        return self.language

    @property
    def SourcePath(self):
        return self.source_path

    @property
    def SourceContent(self):
        if not hasattr(self, "_source_content"):
            self._source_content = open(self.source_path, "r").read().split("\n")
        return self._source_content

    # @property
    # def Classes(self):
    #     if not hasattr(self, "_classes"):
    #         self._classes = self.get_classes()

    #     return self._classes

    def get_classes(self):
        classes = []

        # if not language:
        #     language = self.language

        for line in self.SourceContent:
            babel_class = self.language.GetClass(self, line)
            if not babel_class:
                continue

            classes.append(babel_class)

        return classes

    # ******************************************* #
    def ConvertTo(self, output_io):
        print(self.Language.DisplayName + " -> " + output_io.Language.DisplayName)

        lines = []
        lines.extend(output_io.Language.GetOutputHeader())

        classes = self.get_classes()
        for babel_class in classes:
            lines.extend(babel_class.ConvertTo(output_io))

        return lines


class DashBabel:
    _source_content: DashBabelIO.SourceContent

    def __init__(self, source_path):
        self.exts = ["py", "js", "cs"]
        self.input = DashBabelIO(source_path)
        self.outputs = self.get_outputs()

        # self.watch()
        self.CompileAll()

    @property
    def SourceContent(self):
        if not hasattr(self, "_source_content"):
            self._source_content = self.input.SourceContent
        return self._source_content

    def get_outputs(self):
        outputs = []

        for line in self.SourceContent:
            if "BABLEDASH" not in line:
                continue

            line = line.replace("->", " ")
            line = line.split("BABLEDASH")[-1].strip()
            ext = line.split(".")[-1]

            if ext not in self.exts:
                continue

            if not os.path.exists(line):
                continue

            outputs.append(DashBabelIO(line))

        if len(outputs) == 0:
            sys.exit("\nNo Valid outputs were found. Include outputs at the top of the source file")

        return outputs

    def CompileAll(self):

        for output in self.outputs:
            generated_lines = self.input.ConvertTo(output)

            open(output.SourcePath, "w").write("\n".join(generated_lines))


if __name__ == "__main__":
    test_path = "/Users/rmartin/Google Drive/authentic/authentic_tools/"
    test_path += "client/bin/performance/performance_api/performance_api.js"

    DashBabel(test_path)
