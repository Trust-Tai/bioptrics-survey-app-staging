import React from 'react';

type SettingsTabProps = {
	survey: any;
	setSurvey: (next: any) => void;
	setHasUnsavedChanges: (flag: boolean) => void;
	triggerAutoSave: () => void;
};

export const SettingsTab: React.FC<SettingsTabProps> = ({
	survey,
	setSurvey,
	setHasUnsavedChanges,
	triggerAutoSave,
}) => {
	return (
		<div className="survey-builder-panel">
			<div className="survey-builder-panel-header">
				<h2 className="survey-builder-panel-title">Settings</h2>
			</div>
			<div style={{ padding: 20 }}>
				<div style={{ marginBottom: 20 }}>
					<h3 style={{ fontSize: 18, fontWeight: 600, color: '#552a47', marginBottom: 16 }}>Response Settings</h3>
					<div style={{ marginBottom: 12 }}>
						<label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
							<input
								type="checkbox"
								checked={survey?.defaultSettings?.allowRetake !== false}
								onChange={() => {
									const defaultSettings = survey.defaultSettings || {};
									const currentValue = defaultSettings.allowRetake !== false;
									const updatedSurvey = {
										...survey,
										defaultSettings: {
											...defaultSettings,
											allowRetake: !currentValue,
											retakeMode: defaultSettings.retakeMode || 'replace',
										},
									};
									setSurvey(updatedSurvey);
									setHasUnsavedChanges(true);
									triggerAutoSave();
								}}
								style={{ width: 18, height: 18, accentColor: '#552a47' }}
							/>
							Allow Survey Retake
						</label>
						<div style={{ marginLeft: 24, fontSize: 14, color: '#666', marginTop: 4 }}>
							When enabled, users can restart the survey after completion
						</div>

						{survey?.defaultSettings?.allowRetake !== false && (
							<div style={{ marginLeft: 24, marginTop: 12, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
								<div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#4a5568' }}>
									How should retakes be handled?
								</div>
								<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
									<label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
										<input
											type="radio"
											name="retakeMode"
											checked={survey?.defaultSettings?.retakeMode !== 'new'}
											onChange={() => {
												const defaultSettings = survey.defaultSettings || {};
												setSurvey({
													...survey,
													defaultSettings: {
														...defaultSettings,
														retakeMode: 'replace',
													},
												});
												setHasUnsavedChanges(true);
												triggerAutoSave();
											}}
											style={{ accentColor: '#552a47' }}
										/>
										<span>Replace original response</span>
									</label>
									<label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
										<input
											type="radio"
											name="retakeMode"
											checked={survey?.defaultSettings?.retakeMode === 'new'}
											onChange={() => {
												const defaultSettings = survey.defaultSettings || {};
												setSurvey({
													...survey,
													defaultSettings: {
														...defaultSettings,
														retakeMode: 'new',
													},
												});
												setHasUnsavedChanges(true);
												triggerAutoSave();
											}}
											style={{ accentColor: '#552a47' }}
										/>
										<span>Add as new response</span>
									</label>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			</div>
	);
};

export default SettingsTab;


