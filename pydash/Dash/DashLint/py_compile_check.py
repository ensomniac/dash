# Ensomniac 2021 Ryan Martin, ryan@ensomniac.com
#                Andrew Stet, stetandrew@gmail.com

def CompileToCheckForErrors(code_path, linted_code_line_list_to_print=[], debug_text=""):
    try:
        compile(open(code_path, "r").read(), code_path, "exec")

        if len(debug_text):
            return True, f"\n{'-'*44}DEBUG START{'-'*44}\n\n{debug_text}\n\n{'-'*45}DEBUG END{'-'*45}\n"
        elif len(linted_code_line_list_to_print):
            return True, f"\n{'-'*41}LINT PREVIEW START{'-'*41}\n" \
                         + '\n'.join(linted_code_line_list_to_print) \
                         + f"\n{'-'*42}LINT PREVIEW END{'-'*42}\n"
        else:
            return True, "(DashLint) Success!"

    except Exception as e:
        return False, e
