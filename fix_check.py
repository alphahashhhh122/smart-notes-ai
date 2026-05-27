content = open('backend/app/api/routes/ai.py', 'r').read()
print('HAS_OPENAI' if 'openai.com' in content else 'NO_OPENAI')
print('HAS_GEMINI' if 'generativelanguage' in content else 'NO_GEMINI')
