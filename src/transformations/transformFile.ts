import ts from "typescript";
import { Diagnostics } from "../classes/diagnostics";
import { TransformState } from "../classes/transformState";
import { f } from "../util/factory";
import { transformStatementList } from "./transformStatementList";

export function transformFile(state: TransformState, file: ts.SourceFile): ts.SourceFile {
	const statements = transformStatementList(state, file.statements);

	const imports = state.fileImports.get(file.fileName);
	if (imports) {
		statements.splice(
			0,
			0,
			...imports.map((info) =>
				f.importDeclaration(
					info.path,
					info.entries.map((x) => [x.name, x.identifier]),
				),
			),
		);
	}

	for (const diag of Diagnostics.flush()) {
		state.addDiagnostic(diag);
	}

	const sourceFile = f.update.sourceFile(file, statements);
	state.buildInfo.save();

	return sourceFile;
}
